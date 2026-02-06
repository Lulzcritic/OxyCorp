import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestStatus, QuestType } from '@prisma/client';
import { QUEST_TEMPLATES, QuestTemplate } from './directives.constants';
import { OnEvent } from '@nestjs/event-emitter';

// Event Payload Interfaces
export interface MiningCompleteEvent {
  userId: string;
  item: string;
  quantity: number;
}

export interface RefiningCompleteEvent {
  userId: string;
  item: string;
  quantity: number;
}

@Injectable()
export class DirectivesService {
  constructor(private prisma: PrismaService) {}

  async getActiveQuests(userId: string) {
    return this.prisma.quest.findMany({
      where: {
        userId,
        status: QuestStatus.ACTIVE,
      },
    });
  }

  async generateDaily(userId: string) {
    const activeInfo = await this.prisma.quest.count({
      where: { userId, status: QuestStatus.ACTIVE },
    });

    if (activeInfo >= 3) {
      throw new BadRequestException('You already have 3 active directives.');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { bunker_level: true },
    });
    const level = user?.bunker_level || 1;
    const difficultyMultiplier = 1 + (level - 1) * 0.2;

    const needed = 3 - activeInfo;
    const newQuests: any[] = [];

    for (let i = 0; i < needed; i++) {
      const template = this.getRandomTemplate();
      const count = Math.ceil(template.baseTarget.count * difficultyMultiplier);
      const credits = Math.ceil(template.baseReward.credits * difficultyMultiplier);
      const xp = Math.ceil(template.baseReward.xp * difficultyMultiplier);

      newQuests.push({
        userId,
        type: template.type,
        target: { ...template.baseTarget, count },
        reward: { credits, xp },
        status: QuestStatus.ACTIVE,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });
    }

    await this.prisma.quest.createMany({ data: newQuests });
    return this.getActiveQuests(userId);
  }

  private getRandomTemplate(): QuestTemplate {
    const index = Math.floor(Math.random() * QUEST_TEMPLATES.length);
    return QUEST_TEMPLATES[index];
  }

  async refreshQuests(userId: string) {
    await this.prisma.quest.deleteMany({
      where: { userId, status: QuestStatus.ACTIVE },
    });
    return this.generateDaily(userId);
  }

  // --- Quest Claim Logic ---

  async claimQuest(userId: string, questId: string) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
    });

    if (!quest || quest.userId !== userId) {
      throw new BadRequestException('Quest not found or not owned by user.');
    }

    if (quest.status !== QuestStatus.ACTIVE) {
      throw new BadRequestException('Quest is not active.');
    }

    const target = quest.target as { item?: string; count: number };
    if (quest.progress < target.count) {
      throw new BadRequestException(
        `Quest not complete. Progress: ${quest.progress}/${target.count}`,
      );
    }

    const reward = quest.reward as { credits: number; xp: number };

    return this.prisma.$transaction(async (tx) => {
      await tx.quest.update({
        where: { id: questId },
        data: { status: QuestStatus.COMPLETED },
      });

      await tx.user.update({
        where: { id: userId },
        data: {
          credits: { increment: BigInt(reward.credits) },
          xp: { increment: BigInt(reward.xp) },
        },
      });

      return {
        success: true,
        creditsAwarded: reward.credits,
        xpAwarded: reward.xp,
      };
    });
  }

  // --- Event Listeners ---

  @OnEvent('mining.complete')
  async handleMiningComplete(payload: MiningCompleteEvent) {
    await this.incrementQuestProgress(
      payload.userId,
      QuestType.MINING,
      payload.item,
      payload.quantity,
    );
  }

  @OnEvent('refining.complete')
  async handleRefiningComplete(payload: RefiningCompleteEvent) {
    await this.incrementQuestProgress(
      payload.userId,
      QuestType.REFINING,
      payload.item,
      payload.quantity,
    );
  }

  private async incrementQuestProgress(
    userId: string,
    type: QuestType,
    item: string,
    quantity: number,
  ) {
    const quests = await this.prisma.quest.findMany({
      where: {
        userId,
        type,
        status: QuestStatus.ACTIVE,
      },
    });

    for (const quest of quests) {
      const target = quest.target as { item?: string; count: number };
      if (target.item === item) {
        await this.prisma.quest.update({
          where: { id: quest.id },
          data: { progress: { increment: quantity } },
        });
      }
    }
  }
}
