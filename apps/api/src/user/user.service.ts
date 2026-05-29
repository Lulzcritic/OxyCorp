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
      equipment: user.equipment || {}, // ensure it returns an object
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

  async equipItem(userId: string, slot: string, itemId: string, quantity = 1) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { inventory: true },
      });

      if (!user) throw new Error('User not found');

      const invItem = user.inventory.find(i => i.item === itemId);
      if (!invItem || invItem.quantity < BigInt(quantity)) {
        throw new Error('Item not found in inventory or insufficient quantity');
      }

      const currentEquipment: Record<string, any> = (user.equipment as Record<string, any>) || {};
      const previousItemId = currentEquipment[slot];

      // Remove the exact required quantity of the new item
      if (invItem.quantity === BigInt(quantity)) {
        await tx.inventory.delete({ where: { id: invItem.id } });
      } else {
        await tx.inventory.update({
          where: { id: invItem.id },
          data: { quantity: invItem.quantity - BigInt(quantity) },
        });
      }

      // If something was already equipped, return exactly 1 of it to the inventory
      if (previousItemId) {
        const existingInvItem = await tx.inventory.findUnique({
          where: { userId_item: { userId, item: previousItemId } },
        });

        if (existingInvItem) {
          await tx.inventory.update({
            where: { id: existingInvItem.id },
            data: { quantity: existingInvItem.quantity + 1n },
          });
        } else {
          await tx.inventory.create({
            data: { userId, item: previousItemId, quantity: 1n },
          });
        }
      }

      // Update equipment field
      currentEquipment[slot] = itemId;

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { equipment: currentEquipment },
        include: { inventory: true },
      });

      return this.serializeUser(updatedUser);
    });
  }

  async unequipItem(userId: string, slot: string) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) throw new Error('User not found');

      const currentEquipment: Record<string, any> = (user.equipment as Record<string, any>) || {};
      const itemId = currentEquipment[slot];

      if (!itemId) throw new Error('No item equipped in this slot');

      // Return EXACTLY 1 item to inventory
      const existingInvItem = await tx.inventory.findUnique({
        where: { userId_item: { userId, item: itemId } },
      });

      if (existingInvItem) {
        await tx.inventory.update({
          where: { id: existingInvItem.id },
          data: { quantity: existingInvItem.quantity + 1n },
        });
      } else {
        await tx.inventory.create({
          data: { userId, item: itemId, quantity: 1n },
        });
      }

      delete currentEquipment[slot];

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { equipment: currentEquipment },
        include: { inventory: true },
      });

      return this.serializeUser(updatedUser);
    });
  }

  private serializeUser(user: any) {
    return {
      ...user,
      credits: user.credits.toString(),
      equipment: user.equipment || {},
      inventory: user.inventory?.map((slot: any) => ({
        ...slot,
        quantity: slot.quantity.toString(),
      })),
      sectors: user.sectors?.map((s: any) => ({
        ...s,
        x: s.x.toString(),
        y: s.y.toString(),
      })),
    };
  }
}
