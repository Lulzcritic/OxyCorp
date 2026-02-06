import { Controller, Post, Get, Request } from '@nestjs/common';
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
}
