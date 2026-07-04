import { Controller, Get, Post } from '@nestjs/common';
import { GameTickService } from './gametick.service';

@Controller('gametick')
export class GameTickController {
  constructor(private readonly gametickService: GameTickService) {}

  @Get('status')
  async getStatus() {
    return this.gametickService.getTickStatus();
  }

  @Post('trigger')
  async triggerTick() {
    return this.gametickService.triggerTick();
  }
}
