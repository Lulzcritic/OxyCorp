import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SwarmsService } from './swarms.service';
import { AuthGuard } from '@nestjs/passport';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}

@Controller('swarms')
export class SwarmsController {
  constructor(private readonly swarmsService: SwarmsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post('save')
  async saveSwarm(
    @Request() req: AuthenticatedRequest,
    @Body()
    body: {
      name: string;
      formation: { droneId: string; x: number; y: number }[];
    },
  ) {
    return this.swarmsService.saveSwarm(
      req.user.userId,
      body.name,
      body.formation,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSwarms(@Request() req: AuthenticatedRequest) {
    return this.swarmsService.getUserSwarms(req.user.userId);
  }
}
