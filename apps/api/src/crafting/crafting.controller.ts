import { Controller, Post, Get, Body, Req } from '@nestjs/common';
import { CraftingService } from './crafting.service';
import { StartCraftingDto } from './dto/start-crafting.dto';

@Controller('crafting')
export class CraftingController {
  constructor(private readonly craftingService: CraftingService) {}

  @Post('start')
  start(@Req() req: any, @Body() dto: StartCraftingDto) {
    const userId = req.user?.userId || req.headers['x-user-id']; 
    if (!userId) throw new Error('User not authenticated');
    
    return this.craftingService.startCrafting(userId, dto);
  }

  @Get('jobs')
  getJobs(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.craftingService.getCraftingJobs(userId);
  }

  @Post('claim')
  claim(@Req() req: any, @Body() body: { jobId: string }) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.craftingService.claimCrafting(userId, body.jobId);
  }
}
