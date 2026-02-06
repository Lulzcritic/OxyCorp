import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MapSpawningService } from '../map/map.spawning.service';
import { SectorType } from '@prisma/client';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private mapSpawningService: MapSpawningService,
  ) {}

  async onboardUser(userId: string, email: string) {
    // Check if user exists
    const existing = await this.prisma.user.findUnique({
      where: { username: email }, // Using email as username for MVP
    });

    if (existing) {
      return { message: 'User already exists', user: existing };
    }

    // Find spawn location
    const spawnLoc = await this.mapSpawningService.findSpawnLocation();

    // Create User, Inventory, and Bunker Sector (Sequential)
    // Note: Credits is BigInt, serialized later
    const newUser = await this.prisma.user.create({
      data: {
        id: userId,
        username: email,
        credits: 1000n, // BigInt literal
        inventory: {
          create: [],
        },
          sectors: {
          create: [
            {
              x: spawnLoc.primary.x,
              y: spawnLoc.primary.y,
              type: SectorType.BUNKER,
            },
            {
              x: spawnLoc.secondary.x,
              y: spawnLoc.secondary.y,
              type: SectorType.RESOURCE,
              resources: this.mapSpawningService.generateResourceNode(),
            },
          ],
        },
      },
      include: {
        inventory: true,
        sectors: true,
      },
    });

    return { message: 'User created', user: newUser };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        inventory: true,
        sectors: true,
      },
    });

    if (!user) return null;

    // Manual serialization of BigInt until interceptor is added
    return {
      ...user,
      credits: user.credits.toString(),
      inventory: user.inventory.map((slot) => ({
        ...slot,
        quantity: slot.quantity.toString(),
      })),
      sectors: user.sectors.map((s) => ({
        ...s,
        x: s.x.toString(),
        y: s.y.toString(),
      })),
    };
  }
}
