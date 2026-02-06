import { Controller, Get, Post, Req, Body } from '@nestjs/common';
import { DirectivesService } from './directives.service';

@Controller('directives')
export class DirectivesController {
  constructor(private readonly directivesService: DirectivesService) {}

  @Get()
  async getDirectives(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.directivesService.getActiveQuests(userId);
  }

  @Post('refresh')
  async refresh(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    // Future: Check for Token Item
    return this.directivesService.refreshQuests(userId);
  }
  
  @Post('daily')
  async triggerDaily(@Req() req: any) {
      const userId = req.user?.userId || req.headers['x-user-id'];
      if (!userId) throw new Error('User not authenticated');
      
      return this.directivesService.generateDaily(userId);
  }

  @Post('claim')
  async claim(@Req() req: any, @Body() body: { questId: string }) {
      const userId = req.user?.userId || req.headers['x-user-id'];
      if (!userId) throw new Error('User not authenticated');
      
      return this.directivesService.claimQuest(userId, body.questId);
  }
}
