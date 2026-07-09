import { Controller, Get, Post, Query, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';

@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  async getLeaderboard(
    @Query('category') category = 'wealth',
    @Query('season') seasonStr?: string,
  ) {
    const validCategories = ['wealth', 'territory', 'combat'];
    if (!validCategories.includes(category.toLowerCase())) {
      throw new BadRequestException(`Invalid category. Must be one of ${validCategories.join(', ')}`);
    }

    let season: number | undefined;
    if (seasonStr) {
      season = parseInt(seasonStr, 10);
      if (isNaN(season)) {
        throw new BadRequestException('Season query parameter must be a valid integer.');
      }
    }

    try {
      const data = await this.leaderboardService.getLeaderboard(category, season);
      return data;
    } catch (err: any) {
      throw new BadRequestException(err.message || err);
    }
  }

  @Get('seasons')
  async getSeasonsCount() {
    const seasonsCount = await this.leaderboardService.getSeasonsCount();
    return { seasonsCount };
  }

  @Post('advance-season')
  async advanceSeason() {
    return this.leaderboardService.advanceSeason();
  }
}