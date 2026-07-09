import {
  Controller,
  Post,
  Body,
  Get,
  Param,
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
      formation: { droneId: string; slotIndex: number; count: number }[];
      cartridgeId?: string | null;
    },
  ) {
    return this.swarmsService.saveSwarm(
      req.user.userId,
      body.name,
      body.formation,
      body.cartridgeId,
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getSwarms(@Request() req: AuthenticatedRequest) {
    return this.swarmsService.getUserSwarms(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getSwarmById(@Param('id') id: string) {
    return this.swarmsService.getSwarmById(id);
  }
}
