import { Controller, Post, Get } from '@nestjs/common';
import { CompanyAIService } from './company-ai.service';
import { Public } from '../auth/public.decorator';

@Controller('company-ai')
export class CompanyAIController {
  constructor(private readonly companyAIService: CompanyAIService) {}

  @Public()
  @Post('trigger-tick')
  async triggerTick() {
    return this.companyAIService.triggerTick();
  }

  @Public()
  @Get('active-event')
  async getActiveEvent() {
    return this.companyAIService.getActiveEvent();
  }
}