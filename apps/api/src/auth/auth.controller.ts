import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(
    @Body() body: { email: string; username: string; password: string },
  ) {
    return this.authService.register(body.email, body.username, body.password);
  }

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @Get('me')
  async getMe(@Request() req: AuthenticatedRequest) {
    return this.authService.getMe(req.user.userId);
  }

  @Post('logout')
  async logout(@Request() req: AuthenticatedRequest) {
    await this.authService.logout(req.user.userId);
    return { message: 'Logged out successfully' };
  }

  // ─── Discord OAuth ─────────────────────────────────────────

  @Public()
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  async discordLogin() {
    // Passport will redirect to Discord — this body never executes
  }

  @Public()
  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordCallback(@Request() req: any, @Res() res: Response) {
    // req.user is populated by DiscordStrategy.validate()
    const result = await this.authService.validateDiscordUser(req.user);

    // Redirect to frontend with tokens as URL params
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
