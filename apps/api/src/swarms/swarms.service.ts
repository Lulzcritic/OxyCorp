import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BunkerService } from '../bunker/bunker.service';

interface DronePosition {
  droneId: string;
  x: number;
  y: number;
}

@Injectable()
export class SwarmsService {
  constructor(
    private prisma: PrismaService,
    private bunkerService: BunkerService,
  ) {}

  async saveSwarm(userId: string, name: string, formation: DronePosition[]) {
    // 0. Check Max Drone Count (Facility Gate)
    const maxDrones = await this.bunkerService.getMaxDroneCount(userId);
    if (formation.length > maxDrones) {
      throw new BadRequestException(
        `Max ${maxDrones} drones allowed. Upgrade COMMAND_ARRAY for more.`,
      );
    }

    // 1. Validate Grid Bounds (5x5)
    for (const pos of formation) {
      if (pos.x < 0 || pos.x > 4 || pos.y < 0 || pos.y > 4) {
        throw new BadRequestException('Drone position out of bounds (0-4)');
      }
    }

    // 2. Validate Ownership (Inventory Check)
    // Aggregate counts needed per drone type
    const neededCounts = new Map<string, number>();
    for (const pos of formation) {
      const current = neededCounts.get(pos.droneId) || 0;
      neededCounts.set(pos.droneId, current + 1);
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
    // We update if exists by name/user or create new.
    // Logic: If ID is provided update, else create?
    // Simplified: Find one by name or create
    // Actually, "War Room" usually implies ONE active configuration or a list.
    // Let's assume we Upsert based on Name for this user to keep it simple, or just Create.
    // Story says "Upsert Swarm record". Let's use name as unique key for user conceptually?
    // Or just create a new one every time? No, "Configure" implies editing.
    // Let's assume we are editing the "Primary" swarm or a swarm by specific ID.
    // The payload didn't explicitly ask for ID. Let's assume "Default Swarm" if no name provided or match by Name.

    // Better approach: Find existing swarm by name+user, update it. If not, create.
    const existingSwarm = await this.prisma.swarm.findFirst({
      where: { userId, name },
    });

    if (existingSwarm) {
      return this.prisma.swarm.update({
        where: { id: existingSwarm.id },
        data: { formation: JSON.parse(JSON.stringify(formation)) }, // Ensure valid JSON
      });
    } else {
      return this.prisma.swarm.create({
        data: {
          userId,
          name,
          formation: JSON.parse(JSON.stringify(formation)),
          isActive: true,
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
}
