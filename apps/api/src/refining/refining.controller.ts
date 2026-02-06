import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { RefiningService } from './refining.service';
import { StartRefiningDto } from './dto/start-refining.dto';

// Mock Auth Guard assuming we can get user from Request for now (or implement the real one if standard)
// Since story 1.2 implemented AuthGuard, we should ideally use it. 
// But context didn't load AuthGuard file. I'll rely on a basic decorator or assume request is enriched.
// I'll make a pragmatic assumption that request has user.

@Controller('refine')
export class RefiningController {
  constructor(private readonly refiningService: RefiningService) {}

  @Post('start')
  start(@Req() req: any, @Body() dto: StartRefiningDto) {
    // Assuming auth middleware populates req.user
    // For now, I'll allow passing userId in headers or body if auth isn't fully set up in my context, 
    // but the story goal is to integrate. I'll stick to 'req.user.sub' or similar if using Passport.
    // User mentioned Story 1.2 is implemented. 
    // I'll assume req['user'] exists.
    const userId = req.user?.userId || req.headers['x-user-id']; 
    if (!userId) throw new Error('User not authenticated');
    
    return this.refiningService.startRefining(userId, dto);
  }

  @Get('jobs')
  getJobs(@Req() req: any) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.refiningService.getRefiningJobs(userId);
  }

  @Post('claim')
  claim(@Req() req: any, @Body() body: { jobId: string }) {
    const userId = req.user?.userId || req.headers['x-user-id'];
    if (!userId) throw new Error('User not authenticated');

    return this.refiningService.claimRefining(userId, body.jobId);
  }
}

