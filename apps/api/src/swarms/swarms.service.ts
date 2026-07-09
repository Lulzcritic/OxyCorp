import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BunkerService } from '../bunker/bunker.service';

export interface SwarmSlot {
  droneId: string;
  slotIndex: number;
  count: number;
}

@Injectable()
export class SwarmsService {
  constructor(
    private prisma: PrismaService,
    private bunkerService: BunkerService,
  ) {}

  async saveSwarm(userId: string, name: string, formation: SwarmSlot[], cartridgeId?: string | null) {
    // 1. Validate formation slot configuration
    const seenSlots = new Set<number>();
    let totalDronesCount = 0;
    
    for (const slot of formation) {
      if (slot.slotIndex < 0 || slot.slotIndex > 4) {
        throw new BadRequestException('Slot index must be between 0 and 4');
      }
      if (seenSlots.has(slot.slotIndex)) {
        throw new BadRequestException(`Duplicate entry for slot index ${slot.slotIndex}`);
      }
      seenSlots.add(slot.slotIndex);

      if (slot.count < 1 || slot.count > 10) {
        throw new BadRequestException('Count per slot must be between 1 and 10');
      }
      totalDronesCount += slot.count;
    }

    // 0. Check Max Drone Count (Facility Gate)
    const maxDrones = await this.bunkerService.getMaxDroneCount(userId);
    if (totalDronesCount > maxDrones) {
      throw new BadRequestException(
        `Max ${maxDrones} drones allowed. Upgrade COMMAND_ARRAY for more. (Current total: ${totalDronesCount})`,
      );
    }

    // 2. Validate Ownership (Inventory Check)
    const neededCounts = new Map<string, number>();
    for (const slot of formation) {
      const current = neededCounts.get(slot.droneId) || 0;
      neededCounts.set(slot.droneId, current + slot.count);
    }

    // Fetch User Inventory
    const inventory = await this.prisma.inventory.findMany({
      where: {
        userId,
        item: { in: Array.from(neededCounts.keys()) },
      },
    });

    const inventoryMap = new Map<string, bigint>();
    inventory.forEach((inv) => inventoryMap.set(inv.item, inv.quantity));

    // Check availability
    for (const [droneId, count] of neededCounts.entries()) {
      const owned = inventoryMap.get(droneId) || 0n;
      if (owned < BigInt(count)) {
        throw new BadRequestException(
          `Insufficient inventory for drone: ${droneId}. Need ${count}, have ${owned}`,
        );
      }
    }

    // 3. Persist Swarm
    const existingSwarm = await this.prisma.swarm.findFirst({
      where: { userId, name },
    });

    if (existingSwarm) {
      return this.prisma.swarm.update({
        where: { id: existingSwarm.id },
        data: {
          formation: JSON.parse(JSON.stringify(formation)),
          cartridgeId: cartridgeId || null,
        },
      });
    } else {
      return this.prisma.swarm.create({
        data: {
          userId,
          name,
          formation: JSON.parse(JSON.stringify(formation)),
          isActive: true,
          cartridgeId: cartridgeId || null,
        },
      });
    }
  }

  async getUserSwarms(userId: string) {
    return this.prisma.swarm.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSwarmById(id: string) {
    return this.prisma.swarm.findUnique({
      where: { id },
    });
  }
}
