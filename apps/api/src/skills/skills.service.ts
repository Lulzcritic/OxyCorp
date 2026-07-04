import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { calculateLevel, calculateTotalSPFromLevel } from './skills.constants';
import { getSkillById, SKILL_REGISTRY } from './skill-registry.constants';
import { calculateEquipmentModifiers } from '../items/equipment-effects.util';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  async getSkillsData(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, skillPoints: true, specialization: true },
    });

    if (!user) {
      return null;
    }

    const level = calculateLevel(user.xp);
    const skills = await this.prisma.userSkills.findMany({
      where: { userId },
    });

    return {
      xp: user.xp.toString(),
      level,
      skillPoints: user.skillPoints,
      specialization: user.specialization,
      unlockedSkills: skills,
      availableSkills: SKILL_REGISTRY,
    };
  }

  async getUserLevel(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true },
    });
    if (!user) return 1;
    return calculateLevel(user.xp);
  }

  async awardXP(userId: string, amount: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, skillPoints: true, equipment: true },
    });

    if (!user) return;

    const equipment = (user.equipment as Record<string, string>) || {};
    const { modifiers } = calculateEquipmentModifiers(equipment);
    const finalAmount = Math.floor(amount * modifiers.xpMultiplier);

    const currentXP = user.xp;
    const currentLevel = calculateLevel(currentXP);
    const newXP = currentXP + BigInt(finalAmount);
    const newLevel = calculateLevel(newXP);

    const currentTotalSP = calculateTotalSPFromLevel(currentLevel);
    const newTotalSP = calculateTotalSPFromLevel(newLevel);
    const spGain = newTotalSP - currentTotalSP;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        skillPoints: { increment: spGain },
      },
    });

    return {
      xpAwarded: finalAmount,
      newXP: newXP.toString(),
      levelUp: newLevel > currentLevel,
      newLevel,
      spAwarded: spGain,
    };
  }

  // --- Skill Unlocking ---

  async unlockSkill(userId: string, skillId: string) {
    const skillDef = getSkillById(skillId);
    if (!skillDef) {
      throw new BadRequestException(`Skill ${skillId} does not exist.`);
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { skillPoints: true },
    });

    if (!user || user.skillPoints < skillDef.cost) {
      throw new BadRequestException(
        `Insufficient Skill Points. Need ${skillDef.cost}, have ${user?.skillPoints || 0}.`,
      );
    }

    if (skillDef.prereq) {
      const hasPrereq = await this.hasSkill(userId, skillDef.prereq);
      if (!hasPrereq) {
        throw new BadRequestException(
          `Prerequisite skill ${skillDef.prereq} not unlocked.`,
        );
      }
    }

    const existing = await this.prisma.userSkills.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
    if (existing) {
      throw new BadRequestException(`Skill ${skillId} already unlocked.`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { skillPoints: { decrement: skillDef.cost } },
      });

      await tx.userSkills.create({
        data: { userId, skillId, level: 1 },
      });

      return { success: true, skillId, cost: skillDef.cost };
    });
  }

  async hasSkill(userId: string, skillId: string): Promise<boolean> {
    const skill = await this.prisma.userSkills.findUnique({
      where: { userId_skillId: { userId, skillId } },
    });
    return !!skill;
  }

  /**
   * Calculate maximum plot limit for a user based on their Land Baron skills.
   */
  async getPlotLimit(userId: string): Promise<number> {
    // Import constants inline to avoid circular dependency
    const BASE_PLOT_LIMIT = 3;
    const PLOT_BONUS: Record<string, number> = {
      MERCHANT_LAND_1: 2,
      MERCHANT_LAND_2: 3,
      MERCHANT_LAND_3: 4,
    };

    let limit = BASE_PLOT_LIMIT;

    // Check each Land Baron skill and add bonus
    const landSkills = ['MERCHANT_LAND_1', 'MERCHANT_LAND_2', 'MERCHANT_LAND_3'];
    for (const skillId of landSkills) {
      if (await this.hasSkill(userId, skillId)) {
        limit += PLOT_BONUS[skillId];
      }
    }

    return limit;
  }
}

