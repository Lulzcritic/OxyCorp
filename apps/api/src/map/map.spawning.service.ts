import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SectorType } from '@prisma/client';

@Injectable()
export class MapSpawningService {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds a valid spawn location for a new bunker.
   * Ensures minimum distance from existing bunkers.
   */
  async findSpawnLocation(): Promise<{
    primary: { x: bigint; y: bigint };
    secondary: { x: bigint; y: bigint };
  }> {
    const minDistance = 5;

    // Safety break to prevent infinite loops in development/testing
    const maxIterations = 1000;

    // Let's use a robust coordinate generator for the spiral
    // (0,0) -> (1,0) -> (1,1) -> (0,1) -> (-1,1) -> (-1,0) -> (-1,-1) -> (0,-1) -> (1,-1) -> (2,-1)...

    let stepCount = 0;

    // Current position state
    let cx = 0;
    let cy = 0;

    // Direction: 0=Right, 1=Up, 2=Left, 3=Down
    let dir = 0;
    let stepsInThisLeg = 1;
    let stepsTakenInLeg = 0;
    let legChangeCount = 0;

    while (stepCount < maxIterations) {
      const candidateX = BigInt(cx);
      const candidateY = BigInt(cy);

      // Check primary spot
      const isPrimaryValid = await this.validateLocation(
        candidateX,
        candidateY,
        minDistance,
      );

      if (isPrimaryValid) {
        // Now check neighbors for secondary spot
        // Candidates: Up, Down, Left, Right
        const neighbors = [
          { x: candidateX, y: candidateY + 1n }, // Up
          { x: candidateX, y: candidateY - 1n }, // Down
          { x: candidateX - 1n, y: candidateY }, // Left
          { x: candidateX + 1n, y: candidateY }, // Right
        ];

        for (const neighbor of neighbors) {
          // Verify neighbor is empty AND valid distance from OTHER bunkers (excluding our potential new one)
          // Note: validateLocation checks distance to *existing* bunkers.
          // Since our primary isn't created yet, it won't trigger distance check on itself.
          const isSecondaryValid = await this.validateLocation(
            neighbor.x,
            neighbor.y,
            minDistance,
          );

          if (isSecondaryValid) {
            return {
              primary: { x: candidateX, y: candidateY },
              secondary: { x: neighbor.x, y: neighbor.y },
            };
          }
        }
        // If no neighbors valid, continue spiral to find a better primary
      }

      // Move to next spot in spiral
      switch (dir) {
        case 0:
          cx++;
          break; // Right
        case 1:
          cy++;
          break; // Up
        case 2:
          cx--;
          break; // Left
        case 3:
          cy--;
          break; // Down
      }

      stepsTakenInLeg++;

      if (stepsTakenInLeg >= stepsInThisLeg) {
        stepsTakenInLeg = 0;
        dir = (dir + 1) % 4;
        legChangeCount++;
        if (legChangeCount % 2 === 0) {
          stepsInThisLeg++;
        }
      }

      stepCount++;
    }

    throw new Error('Could not find spawn location within iteration limit');
  }

  /**
   * Generates a resource definition for a sector.
   */
  generateResourceNode(): any {
    const rand = Math.random();
    let type = 'IRON';
    if (rand > 0.6) type = 'COPPER';
    if (rand > 0.9) type = 'SILICA';

    // Purity multiplier (0.5 to 1.5)
    // Quantity base 1000
    const richness = 0.5 + Math.random(); 
    const quantity = Math.floor(1000 * richness);

    return {
      type,
      richness: parseFloat(richness.toFixed(2)),
      quantity
    };
  }

  /**
   * Checks if a coordinate is valid for spawning.
   * 1. Check if occupied by a BUNKER (exact match).
   * 2. Check if any OTHER bunker is within minDistance.
   */
  private async validateLocation(
    x: bigint,
    y: bigint,
    minDesc: number,
  ): Promise<boolean> {
    // Range query: count bunkers in box [x-d, x+d], [y-d, y+d]
    // If count > 0, invalid.

    const count = await this.prisma.sector.count({
      where: {
        type: SectorType.BUNKER,
        x: {
          gte: x - BigInt(minDesc),
          lte: x + BigInt(minDesc),
        },
        y: {
          gte: y - BigInt(minDesc),
          lte: y + BigInt(minDesc),
        },
      },
    });

    return count === 0;
  }

  /**
   * Generates sectors around an existing bunker for legacy accounts.
   * Creates a ring of sectors around the bunker location.
   */
  async generateSectorsAroundBunker(userId: string, radius: number = 3): Promise<{ created: number }> {
    // 1. Find user's bunker
    const bunker = await this.prisma.sector.findFirst({
      where: { ownerId: userId, type: SectorType.BUNKER },
    });

    if (!bunker) {
      throw new Error('User does not have a bunker');
    }

    const bunkerX = bunker.x;
    const bunkerY = bunker.y;

    let createdCount = 0;

    // 2. Generate sectors in a ring around the bunker
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        // Skip the bunker location itself
        if (dx === 0 && dy === 0) continue;

        const sectorX = bunkerX + BigInt(dx);
        const sectorY = bunkerY + BigInt(dy);

        // Check if sector already exists
        const existing = await this.prisma.sector.findFirst({
          where: { x: sectorX, y: sectorY },
        });

        if (existing) continue;

        // Determine sector type - some RESOURCE, most EMPTY
        const rand = Math.random();
        let type: SectorType = SectorType.EMPTY;
        let resources: any = undefined;

        // 40% chance of resource sector
        if (rand < 0.4) {
          type = SectorType.RESOURCE;
          resources = this.generateResourceNode();
        }

        // Create the sector (unowned)
        await this.prisma.sector.create({
          data: {
            x: sectorX,
            y: sectorY,
            type,
            resources,
            // ownerId: null - sectors are unclaimed by default
          },
        });

        createdCount++;
      }
    }

    return { created: createdCount };
  }
}

