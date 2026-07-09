import { Controller, Get, Post, Param, Body, Req, BadRequestException } from '@nestjs/common';
import { RpgService } from './rpg.service';

@Controller('rpg')
export class RpgController {
  constructor(private readonly rpgService: RpgService) {}

  @Get('npc/:npcId/dialogue')
  async getNpcDialogue(@Param('npcId') npcId: string, @Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User not authenticated');

    return this.rpgService.getNpcDialogue(userId, npcId);
  }

  @Post('dialogue/respond')
  async respondToDialogue(
    @Body('npcId') npcId: string,
    @Body('questId') questId: string,
    @Body('nodeName') nodeName: string,
    @Body('choiceIndex') choiceIndex: number,
    @Req() req: any
  ) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User not authenticated');

    if (!npcId || !questId || !nodeName || choiceIndex === undefined) {
      throw new BadRequestException('Missing required dialogue payload properties');
    }

    return this.rpgService.respondToDialogue(userId, npcId, questId, nodeName, choiceIndex);
  }

  @Get('quests/my')
  async getMyQuests(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new BadRequestException('User not authenticated');
    return this.rpgService.getUserQuests(userId);
  }

  @Post('quests/sync-json')
  async syncQuests() {
    await this.rpgService.syncQuestsFromJson();
    return { success: true, message: 'Quest definitions synced from JSON config.' };
  }
}
