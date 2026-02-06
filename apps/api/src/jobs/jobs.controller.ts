import { Controller, Post, Get, Body, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { StartJobDto } from './dto/start-job.dto';

interface RequestWithUser {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('start')
  startJob(@Request() req: RequestWithUser, @Body() startJobDto: StartJobDto) {
    return this.jobsService.startJob(req.user.userId, startJobDto);
  }

  @Get('active')
  getActiveJob(@Request() req: RequestWithUser) {
    return this.jobsService.getActiveJob(req.user.userId);
  }

  @Post('claim')
  claimJob(@Request() req: RequestWithUser) {
    return this.jobsService.claimJob(req.user.userId);
  }
}
