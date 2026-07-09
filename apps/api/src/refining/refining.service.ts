import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartRefiningDto } from './dto/start-refining.dto';
import { REFINING_RECIPES } from './refining.constants';
import { JobStatus, JobType } from '@prisma/client';
import { SkillsService } from '../skills/skills.service';
import { getRefiningXP } from '../skills/xp-rewards.constants';

@Injectable()
export class RefiningService {
  constructor(
    private prisma: PrismaService,
    private skillsService: SkillsService,
  ) {}

  async startRefining(userId: string, dto: StartRefiningDto) {
    const recipe = REFINING_RECIPES[dto.recipeId];
    if (!recipe) {
      throw new BadRequestException('Invalid Recipe ID');
    }

    const batches = dto.quantity || 1;
    if (batches < 1) throw new BadRequestException('Quantity must be positive');

    const totalInput = recipe.inputQty * batches;

    return this.prisma.$transaction(async (tx) => {
      // 1. Check Inventory
      const inventory = await tx.inventory.findUnique({
        where: {
          userId_item: {
            userId,
            item: recipe.inputItem,
          },
        },
      });

      if (!inventory || inventory.quantity < BigInt(totalInput)) {
        throw new BadRequestException(
          `Insufficient ${recipe.inputItem}. Need ${totalInput}, have ${inventory?.quantity || 0}`,
        );
      }

      // 2. Deduct Inventory
      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: { decrement: BigInt(totalInput) },
        },
      });

      // 3. Create Job
      // Logic: For simplicity in MVP, we create one job for the whole batch, with scaled duration?
      // Or we can say the "quantity" in the DTO is just "number of times to run recipe".
      // Story says "Queue up a job".
      // Let's make one huge job for the batch for now, or multiple jobs?
      // "Queue up a refining job" -> Singular.
      // Let's make it one job record representing the batch.
      
      const activeEvent = await tx.globalEvent.findFirst({
        where: { active: true },
      });

      let durationMultiplier = 1.0;
      if (activeEvent && typeof activeEvent.effects === 'object' && activeEvent.effects !== null) {
        const effects = activeEvent.effects as Record<string, any>;
        if (typeof effects.refiningDurationMultiplier === 'number') {
          durationMultiplier = effects.refiningDurationMultiplier;
        }
      }

      const totalDuration = Math.round(recipe.durationSeconds * batches * durationMultiplier);

      return tx.job.create({
        data: {
          userId,
          type: JobType.REFINING,
          status: JobStatus.ACTIVE,
          durationSeconds: totalDuration,
          rewardItemId: recipe.outputItem, // We will store the output item here
          // We assume output quantity is determined by the batch size stored in data
          data: {
             recipeId: recipe.id,
             batches: batches,
             outputPerBatch: recipe.outputQty
          },
          // No sectorId for refining
        },
      });
    });
  }

  async getRefiningJobs(userId: string) {
    return this.prisma.job.findMany({
      where: {
        userId,
        type: JobType.REFINING,
        status: { in: [JobStatus.ACTIVE, JobStatus.COMPLETED] },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  /**
   * Calculate yield modifier based on user skills.
   * MERCHANT_YIELD_1: 1.25x, MERCHANT_YIELD_2: 1.5x
   */
  async calculateYield(userId: string): Promise<number> {
    const hasYield2 = await this.skillsService.hasSkill(userId, 'MERCHANT_YIELD_2');
    if (hasYield2) return 1.5;

    const hasYield1 = await this.skillsService.hasSkill(userId, 'MERCHANT_YIELD_1');
    if (hasYield1) return 1.25;

    return 1; // Default 100%
  }

  async claimRefining(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job || job.userId !== userId) {
      throw new BadRequestException('Job not found or not owned by user.');
    }

    if (job.type !== JobType.REFINING) {
      throw new BadRequestException('This is not a refining job.');
    }

    // Check if time passed (lazy completion check)
    const now = new Date();
    const finishTime = new Date(
      job.startedAt.getTime() + job.durationSeconds * 1000,
    );

    if (now < finishTime) {
      throw new BadRequestException('Job is not yet complete.');
    }

    // Calculate Yield
    const yieldMultiplier = await this.calculateYield(userId);
    const jobData = job.data as { batches: number; outputPerBatch: number };
    const baseOutput = jobData.batches * jobData.outputPerBatch;
    const finalOutput = Math.floor(baseOutput * yieldMultiplier);

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

      // 3. Delete Job (or mark as CLAIMED if we want history)
      await tx.job.delete({ where: { id: job.id } });

      return {
        success: true,
        item: job.rewardItemId,
        quantity: finalOutput,
        yieldMultiplier,
      };
    });

    // 4. Award XP based on player level
    const playerLevel = await this.skillsService.getUserLevel(userId);
    const xpAmount = getRefiningXP(playerLevel);
    const xpResult = await this.skillsService.awardXP(userId, xpAmount);

    return {
      ...result,
      xpAwarded: xpResult?.xpAwarded || xpAmount,
      levelUp: xpResult?.levelUp || false,
      newLevel: xpResult?.newLevel,
    };
  }
}
