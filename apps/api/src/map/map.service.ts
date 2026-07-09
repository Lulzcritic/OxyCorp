 import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Sector, SectorType } from '@prisma/client';
import { SkillsService } from '../skills/skills.service';
import { CLAIM_COST_CREDITS, OUTPOST_COST } from './map.constants';
import { calculateEquipmentModifiers } from '../items/equipment-effects.util';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MapService {
  constructor(
    private prisma: PrismaService,
    private skillsService: SkillsService,
    private eventEmitter: EventEmitter2,
  ) {}

  async getSector(id: string) {
    return this.prisma.sector.findUnique({
      where: { id },
    });
  }

  async getSectors(
    centerX: bigint,
    centerY: bigint,
    radius: number,
  ): Promise<Sector[]> {
    const minX = centerX - BigInt(radius);
    const maxX = centerX + BigInt(radius);
    const minY = centerY - BigInt(radius);
    const maxY = centerY + BigInt(radius);

    return this.prisma.sector.findMany({
      where: {
        x: {
          gte: minX,
          lte: maxX,
        },
        y: {
          gte: minY,
          lte: maxY,
        },
      },
    });
  }

  /**
   * Get user's owned sectors count and limit
   */
  async getMySectors(userId: string) {
    const owned = await this.prisma.sector.count({
      where: { ownerId: userId },
    });
    
    const limit = await this.skillsService.getPlotLimit(userId);
    
    const sectors = await this.prisma.sector.findMany({
      where: { ownerId: userId },
    });

    return {
      count: owned,
      limit,
      sectors,
    };
  }

  /**
   * Claim an unowned sector for the user
   */
  async claimSector(userId: string, x: number, y: number) {
    // 1. Find the sector
    const sector = await this.prisma.sector.findFirst({
      where: { x: BigInt(x), y: BigInt(y) },
    });

    if (!sector) {
      throw new BadRequestException('Sector does not exist at these coordinates.');
    }

    // 2. Check if sector can be claimed
    if (sector.ownerId) {
      throw new BadRequestException('This sector is already owned.');
    }

    // Check if within protected Town perimeter (radius = 1)
    const townRadius = 1;
    const nearbyTown = await this.prisma.sector.findFirst({
      where: {
        type: SectorType.TOWN,
        x: {
          gte: BigInt(x - townRadius),
          lte: BigInt(x + townRadius),
        },
        y: {
          gte: BigInt(y - townRadius),
          lte: BigInt(y + townRadius),
        },
      },
    });

    if (nearbyTown) {
      throw new BadRequestException('This sector is within a protected Town perimeter and cannot be claimed.');
    }

    if (sector.type !== SectorType.EMPTY && sector.type !== SectorType.RESOURCE) {
      throw new BadRequestException('Only EMPTY or RESOURCE sectors can be claimed.');
    }

    // 3. Check user's plot limit
    const { count, limit } = await this.getMySectors(userId);
    if (count >= limit) {
      throw new BadRequestException(
        `Plot limit reached (${count}/${limit}). Unlock Land Baron skills to expand.`
      );
    }

    const CLAIM_COST_SERVICE_CREDITS = 10;

    // 4. Check user serviceCredits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { serviceCredits: true },
    });

    if (!user || user.serviceCredits < CLAIM_COST_SERVICE_CREDITS) {
      throw new BadRequestException(
        `Insufficient Service Credits. Need ${CLAIM_COST_SERVICE_CREDITS}, have ${user?.serviceCredits || 0}. Complete Company Directives to earn Service Credits.`
      );
    }

    // 5. Claim the sector (atomic transaction)
    return this.prisma.$transaction(async (tx) => {
      // Deduct service credits
      await tx.user.update({
        where: { id: userId },
        data: { serviceCredits: { decrement: CLAIM_COST_SERVICE_CREDITS } },
      });

      // Assign ownership
      const claimed = await tx.sector.update({
        where: { id: sector.id },
        data: { ownerId: userId },
      });

      return {
        success: true,
        sector: claimed,
        serviceCreditsSpent: CLAIM_COST_SERVICE_CREDITS,
        newPlotCount: count + 1,
        plotLimit: limit,
      };
    });
  }

  /**
   * Install an outpost on an owned resource sector
   */
  async installOutpost(userId: string, sectorId: string) {
    // 1. Find the sector
    const sector = await this.prisma.sector.findUnique({
      where: { id: sectorId },
    });

    if (!sector) {
      throw new BadRequestException('Sector not found.');
    }

    // 2. Validate ownership
    if (sector.ownerId !== userId) {
      throw new BadRequestException('You do not own this sector.');
    }

    // 3. Validate sector type
    if (sector.type !== 'RESOURCE') {
      throw new BadRequestException('Outposts can only be installed on RESOURCE sectors.');
    }

    // 4. Check if already has outpost
    if (sector.hasOutpost) {
      throw new BadRequestException('This sector already has an outpost.');
    }

    // 5. Check credits
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (!user || user.credits < BigInt(OUTPOST_COST.credits)) {
      throw new BadRequestException(
        `Insufficient credits. Need ${OUTPOST_COST.credits}, have ${user?.credits || 0}.`
      );
    }

    // 6. Check materials
    for (const req of OUTPOST_COST.materials) {
      const inv = await this.prisma.inventory.findUnique({
        where: { userId_item: { userId, item: req.item } },
      });
      if (!inv || inv.quantity < BigInt(req.qty)) {
        throw new BadRequestException(
          `Insufficient ${req.item}. Need ${req.qty}, have ${inv?.quantity || 0}.`
        );
      }
    }

    // 7. Install outpost (atomic transaction)
    return this.prisma.$transaction(async (tx) => {
      // Deduct credits
      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: BigInt(OUTPOST_COST.credits) } },
      });

      // Deduct materials
      for (const req of OUTPOST_COST.materials) {
        await tx.inventory.update({
          where: { userId_item: { userId, item: req.item } },
          data: { quantity: { decrement: BigInt(req.qty) } },
        });
      }

      // Set outpost flag
      const updated = await tx.sector.update({
        where: { id: sectorId },
        data: { hasOutpost: true },
      });

      return {
        success: true,
        sector: updated,
        creditsSpent: OUTPOST_COST.credits,
        materialsSpent: OUTPOST_COST.materials,
      };
    });
  }

  async backfillResources() {
    // 1. Get all RESOURCE sectors
    const sectors = await this.prisma.sector.findMany({
      where: { type: 'RESOURCE' },
    });
    
    let count = 0;
    for (const s of sectors) {
      if (!s.resources) {
        const rand = Math.random();
        let type = 'IRON';
        if (rand > 0.6) type = 'COPPER';
        if (rand > 0.9) type = 'SILICA';

        const richness = 0.5 + Math.random(); 
        const capacity = Math.floor(1000 * richness);
        const resources = {
          type,
          richness: parseFloat(richness.toFixed(2)),
          quantity: capacity,
          capacity,
          harvested: [],
        };

        await this.prisma.sector.update({
          where: { id: s.id },
          data: { resources },
        });
        count++;
      }
    }
    return { backfilled: count };
  }

  async getDebugResources() {
      return this.prisma.sector.findMany({
          where: { type: 'RESOURCE' },
          take: 5
      });
  }

  async wipeWorld() {
    // Delete in order of dependency to avoid FK constraints (if no Cascade)
    await this.prisma.job.deleteMany({});
    await this.prisma.inventory.deleteMany({});
    await this.prisma.marketListing.deleteMany({});
    await this.prisma.swarm.deleteMany({});
    await this.prisma.transactionHistory.deleteMany({});
    
    // Sector depends on User (ownerId), but User doesn't depend on Sector strongly (except reverse relation).
    // However, if we delete User first, Sector.ownerId breaks if restricted.
    // If we delete Sector first, it's safe.
    await this.prisma.sector.deleteMany({});
    
    // Finally delete Users
    await this.prisma.user.deleteMany({});
    
    return { status: 'WIPED' };
  }

  /**
   * Harvest a resource node in 3D (instant mining)
   */
  async harvestNode(userId: string, sectorId: string, nodeId: string) {
    // 1. Verify ownership
    const sector = await this.prisma.sector.findUnique({
      where: { id: sectorId },
    });

    if (!sector) {
      throw new BadRequestException('Sector not found.');
    }

    if (sector.ownerId !== userId) {
      throw new BadRequestException('You do not own this sector.');
    }

    // 2. Determine resource type, richness, capacity and quantity from sector
    let resourceType = 'RAW_ORE';
    let yieldAmount = 5;
    let resData: any = {};

    if (sector.resources) {
      resData = sector.resources as any;
      if (resData.type) {
        resourceType = resData.type;
      }
      if (resData.richness) {
        yieldAmount = Math.max(5, Math.floor(10 * resData.richness));
      }
    }

    const richness = resData.richness || 0.5;
    const capacity = resData.capacity || Math.floor(1000 * richness);
    const currentQty = resData.quantity !== undefined ? resData.quantity : capacity;

    if (currentQty <= 0) {
      throw new BadRequestException('This sector resources are depleted. Wait for the next tick.');
    }

    // Calculate yield modifier from equipment
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { equipment: true }
    });
    const equipment = (user?.equipment as Record<string, string>) || {};
    const { modifiers } = calculateEquipmentModifiers(equipment);
    
    // Ensure final yield does not exceed remaining quantity
    const rawYield = Math.floor(yieldAmount * modifiers.miningMultiplier);
    const finalYield = Math.min(rawYield, currentQty);

    const nextQty = Math.max(0, currentQty - finalYield);

    // Update sector resources and add to inventory in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const harvestedList = Array.isArray(resData.harvested) ? [...resData.harvested] : [];
      if (!harvestedList.includes(nodeId)) {
        harvestedList.push(nodeId);
      }

      const updatedResources = {
        ...resData,
        quantity: nextQty,
        capacity,
        harvested: harvestedList,
      };

      await tx.sector.update({
        where: { id: sectorId },
        data: { resources: updatedResources },
      });

      await tx.inventory.upsert({
        where: {
          userId_item: {
            userId,
            item: resourceType,
          },
        },
        update: {
          quantity: { increment: finalYield },
        },
        create: {
          userId,
          item: resourceType,
          quantity: finalYield,
        },
      });

      return {
        success: true,
        mined: resourceType,
        amount: finalYield,
        nodeId,
        remainingQty: nextQty,
        capacity,
        harvested: harvestedList,
      };
    });

    // Emit mining event for quest progress tracking
    this.eventEmitter.emit('mining.complete', {
      userId,
      item: resourceType,
      quantity: finalYield,
    });

    return result;
  }

  async regenerateResources(): Promise<number> {
    const sectors = await this.prisma.sector.findMany({
      where: { type: 'RESOURCE' },
    });

    let regeneratedCount = 0;

    for (const s of sectors) {
      if (!s.resources) continue;
      const resData = s.resources as any;
      const richness = resData.richness || 0.5;
      const capacity = resData.capacity || Math.floor(1000 * richness);
      const currentQty = resData.quantity !== undefined ? resData.quantity : capacity;

      if (currentQty < capacity) {
        // Regenerate 10% of capacity (minimum 50, capped at capacity)
        const regenAmount = Math.max(50, Math.floor(capacity * 0.1));
        const nextQty = Math.min(capacity, currentQty + regenAmount);

        // Adjust the harvested nodes array proportionally
        let harvestedList = Array.isArray(resData.harvested) ? [...resData.harvested] : [];
        const activeCount = Math.min(15, Math.ceil((nextQty / capacity) * 15));
        const numHarvestedToKeep = Math.max(0, 15 - activeCount);
        harvestedList = harvestedList.slice(0, numHarvestedToKeep);

        const updatedResources = {
          ...resData,
          quantity: nextQty,
          capacity,
          harvested: harvestedList,
        };

        await this.prisma.sector.update({
          where: { id: s.id },
          data: { resources: updatedResources },
        });

        regeneratedCount++;
      }
    }

    return regeneratedCount;
  }
}

