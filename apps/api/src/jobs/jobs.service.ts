import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StartJobDto } from './dto/start-job.dto';
import { JobStatus, SectorType } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SkillsService } from '../skills/skills.service';
import { getMiningXP } from '../skills/xp-rewards.constants';
import { OUTPOST_YIELD_BONUS } from '../map/map.constants';

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
    private skillsService: SkillsService,
  ) {}

  async startJob(userId: string, dto: StartJobDto) {
    if (!dto.sectorId) {
       throw new BadRequestException('Sector ID is required for mining operations.');
    }

    // Validate Sector
    const sector = await this.prisma.sector.findUnique({
      where: { id: dto.sectorId }
    });

    if (!sector) {
      throw new BadRequestException('Invalid Sector ID.');
    }

    if (sector.ownerId !== userId) {
      throw new BadRequestException('You can only mine sectors you own.'); // Or ForbiddenException
    }

    if (sector.type !== SectorType.RESOURCE) {
       throw new BadRequestException('This sector contains no resources.');
    }

    // Check active jobs
    const activeJob = await this.prisma.job.findFirst({
      where: {
        userId,
        status: JobStatus.ACTIVE,
      },
    });

    if (activeJob) {
      throw new BadRequestException('You already have an active job.');
    }

    // Fetch active global event for modifiers
    const activeEvent = await this.prisma.globalEvent.findFirst({
      where: { active: true },
    });

    let durationMultiplier = 1.0;
    if (activeEvent && typeof activeEvent.effects === 'object' && activeEvent.effects !== null) {
      const effects = activeEvent.effects as Record<string, any>;
      if (typeof effects.miningDurationMultiplier === 'number') {
        durationMultiplier = effects.miningDurationMultiplier;
      }
    }

    const durationSeconds = Math.round(60 * durationMultiplier);

    // Create job
    return this.prisma.job.create({
      data: {
        userId,
        type: dto.type,
        status: JobStatus.ACTIVE,
        durationSeconds,
        rewardItemId: dto.resource || 'IRON_ORE',
        sectorId: dto.sectorId,
      },
    });
  }

  async getActiveJob(userId: string) {
    return this.prisma.job.findFirst({
      where: {
        userId,
        status: JobStatus.ACTIVE,
      },
      include: {
        sector: true,
      },
    });
  }

  async claimJob(userId: string) {
    const activeJob = await this.getActiveJob(userId);
    if (!activeJob) throw new BadRequestException('No active job to claim.');

    // Check if time passed
    const now = new Date();
    const finishTime = new Date(
      activeJob.startedAt.getTime() + activeJob.durationSeconds * 1000,
    );

    if (now < finishTime) {
      throw new BadRequestException('Job is not yet complete.');
    }

    // Calculate base yield (fixed 10 for MVP)
    let yieldAmount = 10;

    // Apply Outpost Bonus if applicable
    if (activeJob.sector?.hasOutpost) {
      yieldAmount = Math.floor(yieldAmount * (1 + OUTPOST_YIELD_BONUS));
    }
    
    // cast to BigInt for Prisma
    const yieldBigInt = BigInt(yieldAmount);

    // Atomic Transaction: Complete Job + Award Inventory
    const completedJob = await this.prisma.$transaction(async (tx) => {
      // 1. Mark Job Completed
      const updatedJob = await tx.job.update({
        where: { id: activeJob.id },
        data: { status: JobStatus.COMPLETED },
      });

      // 2. Award Inventory (Upsert)
      await tx.inventory.upsert({
        where: {
          userId_item: {
            userId,
            item: activeJob.rewardItemId,
          },
        },
        create: {
          userId,
          item: activeJob.rewardItemId,
          quantity: yieldBigInt,
        },
        update: {
          quantity: { increment: yieldBigInt },
        },
      });

      return updatedJob;
    });

    // 3. Emit mining.complete event for quest progress tracking
    this.eventEmitter.emit('mining.complete', {
      userId,
      item: activeJob.rewardItemId,
      quantity: yieldAmount,
    });

    // 4. Award XP based on player level
    const playerLevel = await this.skillsService.getUserLevel(userId);
    const xpAmount = getMiningXP(playerLevel);
    const xpResult = await this.skillsService.awardXP(userId, xpAmount);

    return {
      ...completedJob,
      xpAwarded: xpResult?.xpAwarded || xpAmount,
      levelUp: xpResult?.levelUp || false,
      newLevel: xpResult?.newLevel,
    };
  }
}
