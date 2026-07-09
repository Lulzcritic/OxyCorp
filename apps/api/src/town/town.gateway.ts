import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

interface SocketWithUser extends Socket {
  user?: {
    userId: string;
    username?: string;
    email?: string;
  };
  townId?: string;
}

@WebSocketGateway({
  namespace: 'town',
  cors: {
    origin: '*',
  },
})
export class TownGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(TownGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: SocketWithUser) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('No token provided');

      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET || 'super-secret-jwt-key',
      });
      client.user = {
        ...payload,
        userId: payload.sub,
      };
      this.logger.log(`Player connected to town socket: ${payload.sub}`);
    } catch (e: any) {
      this.logger.warn(`Town connection rejected: ${e.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: SocketWithUser) {
    if (client.user?.userId) {
      await this.cleanupPlayerPresence(client.user.userId, client.townId);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('town:join')
  async handleJoin(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { townId: string },
  ) {
    const user = client.user;
    if (!user) return;

    const townId = payload.townId;
    client.townId = townId;
    client.join(`town:${townId}`);

    // Create or update this player's presence snapshot in the DB
    const username = user.username || user.email?.split('@')[0] || 'Unknown Operator';
    const snapshot = await this.prisma.townSnapshot.upsert({
      where: { playerId: user.userId },
      update: {
        posX: 0,
        posY: 0,
        posZ: 0,
        rotY: 0,
      },
      create: {
        playerId: user.userId,
        posX: 0,
        posY: 0,
        posZ: 0,
        rotY: 0,
      },
    });

    // 1. Send all OTHER active players in this town to the newly joined player
    const otherPlayers = await this.prisma.townSnapshot.findMany({
      where: {
        playerId: { not: user.userId },
      },
      include: {
        player: {
          select: { username: true, email: true },
        },
      },
    });

    const formattedList = otherPlayers.map((p) => ({
      userId: p.playerId,
      username: p.player?.username || p.player?.email?.split('@')[0] || 'Unknown Operator',
      posX: p.posX,
      posY: p.posY,
      posZ: p.posZ,
      rotY: p.rotY,
    }));

    client.emit('town:players_list', formattedList);

    // 2. Broadcast to other players in this town room that a new player joined
    client.to(`town:${townId}`).emit('town:player_joined', {
      userId: user.userId,
      username,
      posX: snapshot.posX,
      posY: snapshot.posY,
      posZ: snapshot.posZ,
      rotY: snapshot.rotY,
    });

    this.logger.log(`Player ${user.userId} (${username}) joined town: ${townId}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('town:move')
  async handleMove(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody()
    payload: {
      posX: number;
      posY: number;
      posZ: number;
      rotY: number;
    },
  ) {
    const user = client.user;
    if (!user || !client.townId) return;

    // Asynchronously update position in DB snapshot (no await to keep socket loop fast)
    this.prisma.townSnapshot
      .update({
        where: { playerId: user.userId },
        data: {
          posX: payload.posX,
          posY: payload.posY,
          posZ: payload.posZ,
          rotY: payload.rotY,
        },
      })
      .catch((err) => {
        this.logger.warn(`Failed to update town snapshot for user ${user.userId}: ${err.message}`);
      });

    // Broadcast position update to all other players in the room
    client.to(`town:${client.townId}`).emit('town:player_moved', {
      userId: user.userId,
      posX: payload.posX,
      posY: payload.posY,
      posZ: payload.posZ,
      rotY: payload.rotY,
    });
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('town:leave')
  async handleLeave(@ConnectedSocket() client: SocketWithUser) {
    const user = client.user;
    if (!user) return;

    if (client.townId) {
      await this.cleanupPlayerPresence(user.userId, client.townId);
      client.leave(`town:${client.townId}`);
      client.townId = undefined;
    }
  }

  private async cleanupPlayerPresence(userId: string, townId?: string) {
    try {
      // Delete snapshot from db
      await this.prisma.townSnapshot.deleteMany({
        where: { playerId: userId },
      });

      if (townId) {
        // Broadcast departure to room
        this.server.to(`town:${townId}`).emit('town:player_left', {
          userId,
        });
        this.logger.log(`Player ${userId} left town: ${townId}`);
      }
    } catch (err: any) {
      this.logger.warn(`Error during player presence cleanup: ${err.message}`);
    }
  }

  private extractToken(client: Socket): string | undefined {
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(' ')[0] === 'Bearer') {
      return authHeader.split(' ')[1];
    }
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === 'string') return queryToken;
    return undefined;
  }
}
