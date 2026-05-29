import { Controller, Post, Get, Request, Body } from '@nestjs/common';
import { UserService } from './user.service';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('onboard')
  async onboard(@Request() req: AuthenticatedRequest) {
    // req.user is populated by JwtStrategy { userId, email }
    return this.userService.onboardUser(req.user.userId, req.user.email);
  }

  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.userService.getProfile(req.user.userId);
  }

  @Post('equipment/equip')
  async equipItem(
    @Request() req: AuthenticatedRequest,
    @Body() body: { slot: string; itemId: string; quantity?: number },
  ) {
    return this.userService.equipItem(req.user.userId, body.slot, body.itemId, body.quantity || 1);
  }

  @Post('equipment/unequip')
  async unequipItem(
    @Request() req: AuthenticatedRequest,
    @Body() body: { slot: string },
  ) {
    return this.userService.unequipItem(req.user.userId, body.slot);
  }
}
