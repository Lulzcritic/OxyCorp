import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord-auth';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
  constructor() {
    super({
      clientId: process.env.DISCORD_CLIENT_ID || 'mock_client_id',
      clientSecret: process.env.DISCORD_CLIENT_SECRET || 'mock_client_secret',
      callbackUrl:
        process.env.DISCORD_CALLBACK_URL ||
        'http://localhost:3000/api/auth/discord/callback',
      scope: ['identify', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: any, user: any) => void,
  ): Promise<void> {
    // Extract what we need from the Discord profile
    const user = {
      id: profile.id,
      username: profile.username,
      email: profile.email || undefined,
    };
    done(null, user);
  }
}
