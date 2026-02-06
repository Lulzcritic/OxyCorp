import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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
}
