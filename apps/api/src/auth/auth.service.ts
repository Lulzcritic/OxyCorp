import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MapSpawningService } from '../map/map.spawning.service';
import * as bcrypt from 'bcrypt';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

interface JwtPayload {
  sub: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly REFRESH_SECRET: string;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mapSpawningService: MapSpawningService,
  ) {
    this.REFRESH_SECRET =
      process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key';
  }

  /**
   * Register a new user with email/password credentials.
   */
  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<TokenPair & { user: any }> {
    // Validate input
    if (!email || !username || !password) {
      throw new BadRequestException('Email, username, and password are required');
    }

    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    // Check for existing user
    const existingEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, this.SALT_ROUNDS);
    
    // Find spawn location
    const spawnLoc = await this.mapSpawningService.findSpawnLocation();

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        credits: 1000n,
        inventory: { create: [] },
        sectors: {
          create: [
            {
              x: spawnLoc.primary.x,
              y: spawnLoc.primary.y,
              type: 'BUNKER',
            },
            {
              x: spawnLoc.secondary.x,
              y: spawnLoc.secondary.y,
              type: 'RESOURCE',
              resources: this.mapSpawningService.generateResourceNode(),
            },
          ],
        },
      },
    });

    // Generate surrounding territory
    await this.mapSpawningService.generateSectorsAroundBunker(user.id, 3);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, email, username);

    // Store hashed refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  /**
   * Authenticate user with email/password.
   */
  async login(email: string, password: string): Promise<TokenPair & { user: any }> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email!,
      user.username,
    );
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  /**
   * Refresh access token using a valid refresh token.
   * Implements refresh token rotation for security.
   */
  async refresh(refreshToken: string): Promise<TokenPair> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    // Verify the refresh token JWT
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Find user and verify stored refresh token hash matches
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!tokenValid) {
      // Possible token reuse — invalidate all refresh tokens for this user
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: null },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    // Rotate: issue new token pair
    const tokens = await this.generateTokens(
      user.id,
      user.email || user.username,
      user.username,
    );
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Find or create user from Discord OAuth profile.
   */
  async validateDiscordUser(profile: {
    id: string;
    username: string;
    email?: string;
  }): Promise<TokenPair & { user: any }> {
    let user = await this.prisma.user.findUnique({
      where: { discordId: profile.id },
    });

    if (!user) {
      // Check if a user with this email already exists (link accounts)
      if (profile.email) {
        user = await this.prisma.user.findUnique({
          where: { email: profile.email },
        });
        if (user) {
          // Link Discord to existing account
          user = await this.prisma.user.update({
            where: { id: user.id },
            data: { discordId: profile.id },
          });
        }
      }

      // Create new user if still not found
      if (!user) {
        // Generate unique username from Discord username
        let username = profile.username;
        const existing = await this.prisma.user.findUnique({
          where: { username },
        });
        if (existing) {
          username = `${profile.username}_${profile.id.slice(-4)}`;
        }
        
        // Find spawn location
        const spawnLoc = await this.mapSpawningService.findSpawnLocation();

        user = await this.prisma.user.create({
          data: {
            username,
            email: profile.email || null,
            discordId: profile.id,
            credits: 1000n,
            inventory: { create: [] },
            sectors: {
              create: [
                {
                  x: spawnLoc.primary.x,
                  y: spawnLoc.primary.y,
                  type: 'BUNKER',
                },
                {
                  x: spawnLoc.secondary.x,
                  y: spawnLoc.secondary.y,
                  type: 'RESOURCE',
                  resources: this.mapSpawningService.generateResourceNode(),
                },
              ],
            },
          },
        });

        // Generate surrounding territory
        await this.mapSpawningService.generateSectorsAroundBunker(user.id, 3);
      }
    }

    const tokens = await this.generateTokens(
      user.id,
      user.email || user.username,
      user.username,
    );
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: { id: user.id, email: user.email, username: user.username },
    };
  }

  /**
   * Invalidate user's refresh token (logout).
   */
  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  /**
   * Get current user profile from JWT payload.
   */
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        credits: true,
        bunker_level: true,
        specialization: true,
        xp: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      ...user,
      credits: user.credits.toString(),
      xp: user.xp.toString(),
    };
  }

  // ─── Private helpers ───────────────────────────────────────

  private async generateTokens(
    userId: string,
    email: string,
    username: string,
  ): Promise<TokenPair> {
    const payload: JwtPayload = { sub: userId, email, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.REFRESH_SECRET,
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hash },
    });
  }
}
