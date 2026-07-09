import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { CombatService } from './combat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('combat')
export class CombatController {
  constructor(private readonly combatService: CombatService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('simulate')
  async simulateBattle(@Body() body: { swarmIdA: string; swarmIdB: string }) {
    return this.combatService.resolveBattle(body.swarmIdA, body.swarmIdB);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('attack')
  async launchAttack(@Request() req: any, @Body('sectorId') sectorId: string) {
    return this.combatService.scheduleAttack(req.user.userId, sectorId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('battles')
  async getMyBattles(@Request() req: any) {
    return this.combatService.getUserBattles(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('battle/:id')
  async getBattleDetail(@Param('id') id: string) {
    return this.combatService.getBattleById(id);
  }
}
