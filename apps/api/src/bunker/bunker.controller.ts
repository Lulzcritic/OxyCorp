import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { BunkerService } from './bunker.service';
import { FacilityType } from '@prisma/client';

@Controller('bunker')
export class BunkerController {
  constructor(private readonly bunkerService: BunkerService) {}

  @Get('facilities')
  getFacilities(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.bunkerService.getFacilities(userId);
  }

  @Post('upgrade')
  upgrade(@Req() req: any, @Body() body: { type: FacilityType }) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.bunkerService.upgradeFacility(userId, body.type);
  }
}
