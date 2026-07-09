import { Injectable, Logger, OnModuleInit, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuestStatus, QuestType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface QuestReward {
  credits?: number;
  serviceCredits?: number;
  xp?: number;
  items?: Array<{ item: string; quantity: number }>;
}

@Injectable()
export class RpgService implements OnModuleInit {
  private readonly logger = new Logger(RpgService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.syncQuestsFromJson();
  }

  /**
   * Syncs quest definitions from seasonal-quests.json into the database
   */
  async syncQuestsFromJson() {
    try {
      const possiblePaths = [
        path.resolve(__dirname, '../../src/rpg/seasonal-quests.json'),
        path.resolve(__dirname, '../rpg/seasonal-quests.json'),
        path.join(process.cwd(), 'apps/api/src/rpg/seasonal-quests.json'),
        path.join(process.cwd(), 'src/rpg/seasonal-quests.json'),
      ];
      let finalPath = '';
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          finalPath = p;
          break;
        }
      }

      if (!finalPath) {
        this.logger.warn(`Quest definitions file not found. Checked: ${possiblePaths.join(', ')}`);
        return;
      }

      const fileData = fs.readFileSync(finalPath, 'utf8');
      const quests = JSON.parse(fileData);

      for (const q of quests) {
        await this.prisma.nPCQuest.upsert({
          where: { id: q.id },
          update: {
            title: q.title,
            description: q.description,
            difficulty: q.difficulty,
            giverNpc: q.giverNpc,
            requirements: q.requirements || {},
            objective: q.objective,
            rewards: q.rewards,
            initialDialogue: q.initialDialogue,
            progressDialogue: q.progressDialogue || {},
            completedDialogue: q.completedDialogue,
          },
          create: {
            id: q.id,
            title: q.title,
            description: q.description,
            difficulty: q.difficulty,
            giverNpc: q.giverNpc,
            requirements: q.requirements || {},
            objective: q.objective,
            rewards: q.rewards,
            initialDialogue: q.initialDialogue,
            progressDialogue: q.progressDialogue || {},
            completedDialogue: q.completedDialogue,
          },
        });
      }

      this.logger.log(`Synced ${quests.length} NPC quest definitions from JSON.`);
    } catch (err: any) {
      this.logger.error(`Failed to sync quests from JSON: ${err.message}`);
    }
  }

  /**
   * Gets current active dialogues/quests for an NPC and user
   */
  async getNpcDialogue(userId: string, npcId: string) {
    // 1. Check if there is an active quest for this NPC
    const activeQuestState = await this.prisma.userQuestState.findFirst({
      where: {
        userId,
        status: QuestStatus.ACTIVE,
        quest: { giverNpc: npcId },
      },
      include: { quest: true },
    });

    if (activeQuestState) {
      const quest = activeQuestState.quest;
      const objective = quest.objective as any;

      // Check if objective is completed
      let isCompleted = false;
      if (objective.type === 'TALK_TO' && objective.npcId === npcId) {
        isCompleted = true;
      } else if (activeQuestState.progress >= (objective.count || 0)) {
        isCompleted = true;
      }

      const dialogueTree = isCompleted
        ? (quest.completedDialogue as any)
        : (quest.progressDialogue as any || quest.initialDialogue as any);

      // Return the dialogue starting node
      const rawNode = dialogueTree['START'];
      if (!rawNode) {
        return this.getDefaultDialogue(npcId);
      }

      // Format text placeholders
      const text = rawNode.text.replace('{progress}', activeQuestState.progress.toString());

      return {
        questId: quest.id,
        questTitle: quest.title,
        npcId,
        nodeName: 'START',
        text,
        choices: rawNode.choices || [],
        state: isCompleted ? 'CAN_COMPLETE' : 'IN_PROGRESS',
      };
    }

    // 2. Check for available quests that meet all requirements
    const allQuests = await this.prisma.nPCQuest.findMany({
      where: { giverNpc: npcId },
    });

    const userCompletedQuests = await this.prisma.userQuestState.findMany({
      where: { userId, status: QuestStatus.COMPLETED },
      select: { questId: true },
    });

    const completedIds = new Set(userCompletedQuests.map((q) => q.questId));

    for (const q of allQuests) {
      // Skip if already completed
      if (completedIds.has(q.id)) continue;

      // Check requirements
      const reqs = q.requirements as any;
      if (reqs && reqs.prevQuestId && !completedIds.has(reqs.prevQuestId)) {
        continue; // Prev quest not completed
      }

      // Found available quest!
      const initialDialogue = q.initialDialogue as any;
      const startNode = initialDialogue['START'];
      if (startNode) {
        return {
          questId: q.id,
          questTitle: q.title,
          npcId,
          nodeName: 'START',
          text: startNode.text,
          choices: startNode.choices || [],
          state: 'AVAILABLE',
        };
      }
    }

    // 3. Fallback default dialogue
    return this.getDefaultDialogue(npcId);
  }

  /**
   * Responds to a dialogue choice and returns the next state/dialogue node
   */
  async respondToDialogue(
    userId: string,
    npcId: string,
    questId: string,
    nodeName: string,
    choiceIndex: number
  ) {
    const quest = await this.prisma.nPCQuest.findUnique({
      where: { id: questId },
    });
    if (!quest) throw new BadRequestException('Quest not found');

    // Determine dialogue tree based on quest state
    const userState = await this.prisma.userQuestState.findUnique({
      where: { userId_questId: { userId, questId } },
    });

    const isCompletedObjective = userState 
      ? userState.status === QuestStatus.COMPLETED || userState.progress >= ((quest.objective as any).count || 0)
      : false;

    let dialogueTree = quest.initialDialogue as any;
    if (userState) {
      if (userState.status === QuestStatus.COMPLETED) {
        dialogueTree = quest.completedDialogue as any;
      } else {
        const objective = quest.objective as any;
        const isComplete = (objective.type === 'TALK_TO' && objective.npcId === npcId) ||
                           (userState.progress >= (objective.count || 0));
        dialogueTree = isComplete ? (quest.completedDialogue as any) : (quest.progressDialogue as any || quest.initialDialogue as any);
      }
    }

    const currentNode = dialogueTree[nodeName];
    if (!currentNode) throw new BadRequestException(`Dialogue node ${nodeName} not found`);

    const choice = currentNode.choices?.[choiceIndex];
    if (!choice) throw new BadRequestException('Invalid choice selection');

    const nextNodeName = choice.nextNode;
    const trigger = choice.trigger;

    // Handle dialogue node triggers
    if (trigger === 'ACCEPT_QUEST') {
      await this.prisma.userQuestState.upsert({
        where: { userId_questId: { userId, questId } },
        update: { status: QuestStatus.ACTIVE, currentStep: nextNodeName },
        create: { userId, questId, status: QuestStatus.ACTIVE, currentStep: nextNodeName },
      });
    } else if (trigger === 'COMPLETE_QUEST') {
      await this.prisma.$transaction(async (tx) => {
        // Mark quest completed
        await tx.userQuestState.update({
          where: { userId_questId: { userId, questId } },
          data: { status: QuestStatus.COMPLETED, currentStep: nextNodeName },
        });

        // Award rewards
        const rewards = quest.rewards as QuestReward;
        if (rewards) {
          const user = await tx.user.findUnique({ where: { id: userId }, select: { credits: true, serviceCredits: true, xp: true } });
          if (user) {
            await tx.user.update({
              where: { id: userId },
              data: {
                credits: user.credits + BigInt(rewards.credits || 0),
                serviceCredits: (user.serviceCredits || 0) + (rewards.serviceCredits || 0),
                xp: user.xp + BigInt(rewards.xp || 0),
              },
            });
          }

          // Award items
          if (rewards.items) {
            for (const rewardItem of rewards.items) {
              const existingInventory = await tx.inventory.findFirst({
                where: { userId, item: rewardItem.item },
              });

              if (existingInventory) {
                await tx.inventory.update({
                  where: { id: existingInventory.id },
                  data: { quantity: existingInventory.quantity + BigInt(rewardItem.quantity) },
                });
              } else {
                await tx.inventory.create({
                  data: {
                    userId,
                    item: rewardItem.item,
                    quantity: BigInt(rewardItem.quantity),
                  },
                });
              }
            }
          }
        }
      });
    }

    // Get the next node
    const nextNode = dialogueTree[nextNodeName];
    if (!nextNode) {
      // Dialogue closed
      return {
        questId,
        npcId,
        nodeName: nextNodeName,
        text: '',
        choices: [],
        state: 'CLOSED',
      };
    }

    const text = nextNode.text.replace('{progress}', userState?.progress?.toString() || '0');

    const response: any = {
      questId,
      npcId,
      nodeName: nextNodeName,
      text,
      choices: nextNode.choices || [],
      state: trigger === 'COMPLETE_QUEST' ? 'COMPLETED' : 'TALKING',
    };

    if (trigger === 'COMPLETE_QUEST') {
      response.rewards = quest.rewards;
      response.questTitle = quest.title;
    }

    return response;
  }

  /**
   * Returns all quest states for a user with full quest metadata
   */
  async getUserQuests(userId: string) {
    const states = await this.prisma.userQuestState.findMany({
      where: { userId },
      include: { quest: true },
      orderBy: { updatedAt: 'desc' },
    });

    return states.map((s) => ({
      questId: s.questId,
      title: s.quest.title,
      description: s.quest.description,
      difficulty: s.quest.difficulty,
      giverNpc: s.quest.giverNpc,
      objective: s.quest.objective,
      rewards: s.quest.rewards,
      status: s.status,
      progress: s.progress,
      currentStep: s.currentStep,
      startedAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));
  }

  /**
   * Helper to return a default dialog when no quest is active/available
   */
  private getDefaultDialogue(npcId: string) {
    let text = 'Connection established. Channels are quiet.';
    if (npcId === 'DECIMUS') {
      text = 'Navigateur Decimus: "OxyCorp is watching your operations, operator. Maintain maximum efficiency."';
    } else if (npcId === 'HELENA') {
      text = 'Sister Helena: "Smelting queues are standing by. Keep the metal hot."';
    } else if (npcId === 'ARBITRE_01') {
      text = 'Arbitre-01: "The simulation parameters are stable. Submit Service Credits for expansions."';
    } else if (npcId === 'V_45') {
      text = 'V-45: "Auction house operations normal. Credits are flowing."';
    } else if (npcId === 'KAELEN') {
      text = 'Commandant Kaelen: "Maintain drone defenses. Swarm vectors are active."';
    }

    return {
      questId: null,
      questTitle: null,
      npcId,
      nodeName: 'START',
      text,
      choices: [
        { text: "[Disconnect channel]", nextNode: 'CLOSE', trigger: 'CLOSE_DIALOGUE' },
      ],
      state: 'DEFAULT',
    };
  }
}
