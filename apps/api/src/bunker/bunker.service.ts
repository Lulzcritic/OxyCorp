import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FacilityType } from '@prisma/client';
import { getFacilityCost } from './bunker.constants';

@Injectable()
export class BunkerService {
  constructor(private prisma: PrismaService) {}

  async getFacilities(userId: string) {
    let facilities = await this.prisma.bunkerFacility.findMany({
      where: { userId },
      orderBy: { type: 'asc' },
    });

    // Auto-initialize for legacy accounts
    if (facilities.length === 0) {
      await this.initializeFacilities(userId);
      facilities = await this.prisma.bunkerFacility.findMany({
        where: { userId },
        orderBy: { type: 'asc' },
      });
    }

    return facilities;
  }

  /**
   * Check if user has the required facility level.
   * Throws BadRequestException if requirement not met.
   */
  async checkFacilityLevel(userId: string, type: FacilityType, minLevel: number): Promise<boolean> {
    const facility = await this.prisma.bunkerFacility.findUnique({
      where: { userId_type: { userId, type } },
    });

    const currentLevel = facility?.level ?? 1;
    if (currentLevel < minLevel) {
      throw new BadRequestException(
        `Requires ${type} Level ${minLevel}. You have Level ${currentLevel}.`,
      );
    }
    return true;
  }

  /**
   * Get max drone count based on COMMAND_ARRAY level.
   */
  async getMaxDroneCount(userId: string): Promise<number> {
    const facility = await this.prisma.bunkerFacility.findUnique({
      where: { userId_type: { userId, type: FacilityType.COMMAND_ARRAY } },
    });
    return facility?.level ?? 1;
  }

  async upgradeFacility(userId: string, type: FacilityType) {
    // 1. Get current facility level
    let facility = await this.prisma.bunkerFacility.findUnique({
      where: { userId_type: { userId, type } },
    });

    // If facility doesn't exist, it means user never had it initialized. Create at level 1.
    if (!facility) {
      facility = await this.prisma.bunkerFacility.create({
        data: { userId, type, level: 1 },
      });
    }

    const targetLevel = facility.level + 1;
    const cost = getFacilityCost(type, targetLevel);

    if (!cost) {
      throw new BadRequestException(`Facility ${type} cannot be upgraded beyond current level.`);
    }

    // 2. Transaction: Check & Deduct Cost, then Upgrade
    return this.prisma.$transaction(async (tx) => {
      // 2a. Check Credits
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user || user.credits < BigInt(cost.credits)) {
        throw new BadRequestException(`Insufficient credits. Need ${cost.credits}.`);
      }

      // 2b. Check Items
      if (cost.items) {
        for (const req of cost.items) {
          const inv = await tx.inventory.findUnique({
            where: { userId_item: { userId, item: req.item } },
          });
          if (!inv || inv.quantity < BigInt(req.quantity)) {
            throw new BadRequestException(`Insufficient ${req.item}. Need ${req.quantity}.`);
          }
        }
      }

      // 3. Deduct Credits
      await tx.user.update({
        where: { id: userId },
        data: { credits: { decrement: BigInt(cost.credits) } },
      });

      // 4. Deduct Items
      if (cost.items) {
        for (const req of cost.items) {
          await tx.inventory.update({
            where: { userId_item: { userId, item: req.item } },
            data: { quantity: { decrement: BigInt(req.quantity) } },
          });
        }
      }

      // 5. Upgrade Facility
      const upgraded = await tx.bunkerFacility.update({
        where: { userId_type: { userId, type } },
        data: { level: targetLevel },
      });

      return upgraded;
    });
  }

  /**
   * Initialize default facilities for a new user.
   * Called during user creation flow.
   */
  async initializeFacilities(userId: string) {
    // Initialize facilities with appropriate starting levels
    // COMMAND_ARRAY starts at level 3 to allow demo battles (3 drones required)
    const facilities = [
      { type: FacilityType.REFINING_VAT, level: 1 },
      { type: FacilityType.LOGISTICS_HUB, level: 1 },
      { type: FacilityType.COMMAND_ARRAY, level: 3 },
    ];

    await this.prisma.bunkerFacility.createMany({
      data: facilities.map((f) => ({ userId, ...f })),
      skipDuplicates: true,
    });
  }
}
