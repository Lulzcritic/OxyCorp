import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RankedUser {
  rank: number;
  userId: string;
  username: string;
  score: string; // Convert BigInt to string for safety
}

export interface LeaderboardStrategy {
  getRankings(prisma: PrismaService, season: number, limit: number): Promise<RankedUser[]>;
}

export class WealthStrategy implements LeaderboardStrategy {
  async getRankings(prisma: PrismaService, season: number, limit: number): Promise<RankedUser[]> {
    const users = await prisma.user.findMany({
      orderBy: { credits: 'desc' },
      take: limit,
      select: { id: true, username: true, credits: true },
    });

    return users.map((u, index) => ({
      rank: index + 1,
      userId: u.id,
      username: u.username,
      score: u.credits.toString(),
    }));
  }
}

export class TerritoryStrategy implements LeaderboardStrategy {
  async getRankings(prisma: PrismaService, season: number, limit: number): Promise<RankedUser[]> {
    // Count sectors owned by each user
    const rawSectors = await prisma.sector.groupBy({
      by: ['ownerId'],
      _count: {
        id: true,
      },
      where: {
        ownerId: { not: null },
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    const userIds = rawSectors.map((s) => s.ownerId as string);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u.username]));

    return rawSectors.map((s, index) => ({
      rank: index + 1,
      userId: s.ownerId as string,
      username: userMap.get(s.ownerId as string) || 'Unknown Player',
      score: s._count.id.toString(),
    }));
  }
}

export class CombatStrategy implements LeaderboardStrategy {
  async getRankings(prisma: PrismaService, season: number, limit: number): Promise<RankedUser[]> {
    // Read from UserSeasonStats for the current season
    const stats = await prisma.userSeasonStats.findMany({
      where: { season },
      orderBy: { wins: 'desc' },
      take: limit,
      include: {
        user: { select: { username: true } },
      },
    });

    return stats.map((s, index) => ({
      rank: index + 1,
      userId: s.userId,
      username: s.user.username,
      score: s.wins.toString(),
    }));
  }
}

@Injectable()
export class LeaderboardService implements OnModuleInit {
  private strategies = new Map<string, LeaderboardStrategy>();

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.registerStrategy('wealth', new WealthStrategy());
    this.registerStrategy('territory', new TerritoryStrategy());
    this.registerStrategy('combat', new CombatStrategy());
  }

  registerStrategy(category: string, strategy: LeaderboardStrategy) {
    this.strategies.set(category.toLowerCase(), strategy);
  }

  async getLeaderboard(category: string, season?: number, limit = 10): Promise<RankedUser[]> {
    const strategy = this.strategies.get(category.toLowerCase());
    if (!strategy) {
      throw new Error(`Leaderboard category '${category}' is not supported.`);
    }

    // Get current season from GameTick if not provided
    let activeSeason = season;
    if (activeSeason === undefined) {
      const tick = await this.prisma.gameTick.findUnique({
        where: { id: 1 },
      });
      activeSeason = tick ? tick.season : 1;
    }

    return strategy.getRankings(this.prisma, activeSeason, limit);
  }

  async advanceSeason() {
    // 1. Get current season
    const tick = await this.prisma.gameTick.findUnique({
      where: { id: 1 },
    });

    if (!tick) {
      throw new Error('GameTick singleton not initialized.');
    }

    const currentSeason = tick.season;
    const nextSeason = currentSeason + 1;

    // 2. Snapshot current stats for all users in the ending season
    const users = await this.prisma.user.findMany({
      include: {
        sectors: true,
      },
    });

    await this.prisma.$transaction(async (tx) => {
      for (const user of users) {
        // Find if they already have combat wins recorded in the current season, otherwise 0
        const seasonStats = await tx.userSeasonStats.findUnique({
          where: {
            userId_season: {
              userId: user.id,
              season: currentSeason,
            },
          },
        });

        const wins = seasonStats ? seasonStats.wins : 0;

        // Upsert snapshot stats for current season
        await tx.userSeasonStats.upsert({
          where: {
            userId_season: {
              userId: user.id,
              season: currentSeason,
            },
          },
          update: {
            credits: user.credits,
            sectors: user.sectors.length,
          },
          create: {
            userId: user.id,
            season: currentSeason,
            credits: user.credits,
            sectors: user.sectors.length,
            wins,
          },
        });

        // Initialize empty stats for the new season
        await tx.userSeasonStats.create({
          data: {
            userId: user.id,
            season: nextSeason,
            credits: 0n,
            sectors: 0,
            wins: 0,
          },
        });
      }

      // 3. Update global season number
      await tx.gameTick.update({
        where: { id: 1 },
        data: { season: nextSeason },
      });
    });

    return {
      success: true,
      endedSeason: currentSeason,
      newSeason: nextSeason,
    };
  }

  async getSeasonsCount(): Promise<number> {
    const tick = await this.prisma.gameTick.findUnique({
      where: { id: 1 },
    });
    return tick ? tick.season : 1;
  }
}