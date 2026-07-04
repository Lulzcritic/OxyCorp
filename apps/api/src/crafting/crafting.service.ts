import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartCraftingDto } from './dto/start-crafting.dto';
import { CRAFTING_RECIPES } from './crafting.constants';
import { JobStatus, JobType } from '@prisma/client';
import { SkillsService } from '../skills/skills.service';
import { getRefiningXP } from '../skills/xp-rewards.constants';

@Injectable()
export class CraftingService {
  constructor(
    private prisma: PrismaService,
    private skillsService: SkillsService,
  ) {}

  async startCrafting(userId: string, dto: StartCraftingDto) {
    const recipe = CRAFTING_RECIPES[dto.recipeId];
    if (!recipe) {
      throw new BadRequestException('Invalid Recipe ID');
    }

    // Verify requirements (blueprint or skill)
    if (recipe.requiredSkill || recipe.requiredBlueprintItemId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (!user) throw new BadRequestException('User not found');

      const blueprints: string[] = (user.blueprints as string[]) || [];
      const hasBlueprint = blueprints.includes(recipe.id);

      const hasSkill = recipe.requiredSkill
        ? await this.skillsService.hasSkill(userId, recipe.requiredSkill)
        : false;

      if (!hasBlueprint && !hasSkill) {
        throw new BadRequestException('Recipe is locked. Blueprint decryption or required skill needed.');
      }
    }

    const batches = dto.quantity || 1;
    if (batches < 1) throw new BadRequestException('Quantity must be positive');

    return this.prisma.$transaction(async (tx) => {
      // 1. Check all inputs
      for (const req of recipe.inputMaterials) {
        const totalReq = req.qty * batches;
        const inventory = await tx.inventory.findUnique({
          where: {
            userId_item: {
              userId,
              item: req.item,
            },
          },
        });

        if (!inventory || inventory.quantity < BigInt(totalReq)) {
          throw new BadRequestException(
            `Insufficient ${req.item}. Need ${totalReq}, have ${inventory?.quantity || 0}`,
          );
        }
      }

      // 2. Deduct all inputs
      for (const req of recipe.inputMaterials) {
        const totalReq = req.qty * batches;
        await tx.inventory.update({
          where: {
            userId_item: {
              userId,
              item: req.item,
            },
          },
          data: {
            quantity: { decrement: BigInt(totalReq) },
          },
        });
      }

      // 3. Create Crafting Job
      const totalDuration = recipe.durationSeconds * batches;

      return tx.job.create({
        data: {
          userId,
          type: JobType.CRAFTING,
          status: JobStatus.ACTIVE,
          durationSeconds: totalDuration,
          rewardItemId: recipe.outputItem,
          data: {
            recipeId: recipe.id,
            batches: batches,
            outputPerBatch: recipe.outputQty,
          },
        },
      });
    });
  }

  async getCraftingJobs(userId: string) {
    return this.prisma.job.findMany({
      where: {
        userId,
        type: JobType.CRAFTING,
        status: { in: [JobStatus.ACTIVE, JobStatus.COMPLETED] },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async claimCrafting(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.userId !== userId) {
      throw new BadRequestException('Job not found or not owned by user.');
    }

    if (job.type !== JobType.CRAFTING) {
      throw new BadRequestException('This is not a crafting job.');
    }

    // Check if time passed (lazy completion check)
    const now = new Date();
    const finishTime = new Date(
      job.startedAt.getTime() + job.durationSeconds * 1000,
    );

    if (now < finishTime) {
      throw new BadRequestException('Job is not yet complete.');
    }

    const jobData = job.data as { batches: number; outputPerBatch: number };
    const finalOutput = jobData.batches * jobData.outputPerBatch;

    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Mark Job Completed
      await tx.job.update({
        where: { id: job.id },
        data: { status: JobStatus.COMPLETED },
      });

      // 2. Award Inventory
      await tx.inventory.upsert({
        where: {
          userId_item: {
            userId,
            item: job.rewardItemId,
          },
        },
        create: {
          userId,
          item: job.rewardItemId,
          quantity: BigInt(finalOutput),
        },
        update: {
          quantity: { increment: BigInt(finalOutput) },
        },
      });

      // 3. Delete Job
      await tx.job.delete({ where: { id: job.id } });

      return {
        success: true,
        item: job.rewardItemId,
        quantity: finalOutput,
      };
    });

    // 4. Award XP (double refining XP for equipment)
    const playerLevel = await this.skillsService.getUserLevel(userId);
    const xpAmount = getRefiningXP(playerLevel) * 2;
    const xpResult = await this.skillsService.awardXP(userId, xpAmount);

    return {
      ...result,
      xpAwarded: xpResult?.xpAwarded || xpAmount,
      levelUp: xpResult?.levelUp || false,
      newLevel: xpResult?.newLevel,
    };
  }
}
