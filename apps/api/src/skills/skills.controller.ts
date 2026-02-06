import { Controller, Get, Post, Req, Body } from '@nestjs/common';
import { SkillsService } from './skills.service';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  async getSkills(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.skillsService.getSkillsData(userId);
  }

  @Post('unlock')
  async unlock(@Req() req: any, @Body() body: { skillId: string }) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.skillsService.unlockSkill(userId, body.skillId);
  }
}
