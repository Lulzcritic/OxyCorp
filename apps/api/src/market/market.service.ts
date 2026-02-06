import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { SkillsService } from '../skills/skills.service';
import { getMarketBuyXP, getMarketSellXP } from '../skills/xp-rewards.constants';

@Injectable()
export class MarketService {
  constructor(
    private prisma: PrismaService,
    private skillsService: SkillsService,
  ) {}

  async createListing(userId: string, dto: CreateListingDto) {
    // Transactional Escrow:
    // 1. Verify and Deduct Inventory
    // 2. Create Listing

    return this.prisma.$transaction(async (tx) => {
      // 1. Check Inventory
      const userInventory = await tx.inventory.findUnique({
        where: {
          userId_item: {
            userId,
            item: dto.itemId,
          },
        },
      });

      if (!userInventory || userInventory.quantity < BigInt(dto.quantity)) {
        throw new BadRequestException('Insufficient inventory to list items.');
      }

      // 2. Deduct Inventory
      await tx.inventory.update({
        where: { id: userInventory.id },
        data: {
          quantity: { decrement: BigInt(dto.quantity) },
        },
      });

      // 3. Create Listing
      const listing = await tx.marketListing.create({
        data: {
          sellerId: userId,
          itemId: dto.itemId,
          quantity: BigInt(dto.quantity),
          pricePerUnit: BigInt(dto.price),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours expiry default
        },
      });

      // Convert BigInt for JSON response
      return {
        ...listing,
        quantity: listing.quantity.toString(),
        pricePerUnit: listing.pricePerUnit.toString(),
      };
    });
  }

  async getActiveListings() {
    const listings = await this.prisma.marketListing.findMany({
      where: {
        expiresAt: { gt: new Date() },
        isBuyOrder: false,
      },
      include: { seller: { select: { username: true } } },
      orderBy: { pricePerUnit: 'asc' },
    });

    return listings.map((l) => ({
      ...l,
      quantity: l.quantity.toString(),
      pricePerUnit: l.pricePerUnit.toString(),
      sellerName: l.seller.username,
    }));
  }

  async buyListing(buyerId: string, listingId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Get Listing & Buyer
      const listing = await tx.marketListing.findUnique({
        where: { id: listingId },
      });

      if (!listing) throw new BadRequestException('Listing not found.');
      if (listing.sellerId === buyerId)
        throw new BadRequestException('Cannot buy your own listing.');

      const buyer = await tx.user.findUnique({ where: { id: buyerId } });
      if (!buyer) throw new BadRequestException('Buyer not found.');

      const totalCost = listing.pricePerUnit * listing.quantity; // Buying full listing for MVP

      if (buyer.credits < totalCost) {
        throw new BadRequestException('Insufficient credits.');
      }

      // 2. Transfer Credits
      await tx.user.update({
        where: { id: buyerId },
        data: { credits: { decrement: totalCost } },
      });

      await tx.user.update({
        where: { id: listing.sellerId },
        data: { credits: { increment: totalCost } },
      });

      // 3. Transfer Items (Upsert for Buyer)
      await tx.inventory.upsert({
        where: {
          userId_item: { userId: buyerId, item: listing.itemId },
        },
        create: {
          userId: buyerId,
          item: listing.itemId,
          quantity: listing.quantity,
        },
        update: {
          quantity: { increment: listing.quantity },
        },
      });

      // 4. Delete Listing (Mark as filled/sold - deleting for simplicity as per plan)
      await tx.marketListing.delete({ where: { id: listingId } });

      // 5. Audit Log
      await tx.transactionHistory.create({
        data: {
          buyerId,
          sellerId: listing.sellerId,
          itemId: listing.itemId,
          quantity: listing.quantity,
          totalPrice: totalCost,
        },
      });

      return { success: true, message: 'Purchase successful', sellerId: listing.sellerId };
    });

    // 6. Award XP to buyer
    const buyerLevel = await this.skillsService.getUserLevel(buyerId);
    const buyerXP = getMarketBuyXP(buyerLevel);
    const buyerXPResult = await this.skillsService.awardXP(buyerId, buyerXP);

    // 7. Award XP to seller
    const sellerLevel = await this.skillsService.getUserLevel(result.sellerId);
    const sellerXP = getMarketSellXP(sellerLevel);
    await this.skillsService.awardXP(result.sellerId, sellerXP);

    return {
      success: result.success,
      message: result.message,
      xpAwarded: buyerXPResult?.xpAwarded || buyerXP,
      levelUp: buyerXPResult?.levelUp || false,
      newLevel: buyerXPResult?.newLevel,
    };
  }
}

