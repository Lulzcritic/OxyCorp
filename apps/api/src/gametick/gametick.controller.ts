import { Controller, Get, Post } from '@nestjs/common';
import { GameTickService } from './gametick.service';
import { Public } from '../auth/public.decorator';

@Controller('gametick')
export class GameTickController {
  constructor(private readonly gametickService: GameTickService) {}

  @Public()
  @Get('status')
  async getStatus() {
    return this.gametickService.getTickStatus();
  }

  @Public()
  @Post('trigger')
  async triggerTick() {
    return this.gametickService.triggerTick();
  }
}
