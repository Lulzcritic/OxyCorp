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
import { UseGuards, UnauthorizedException } from '@nestjs/common';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  namespace: 'chat',
  cors: {
    origin: '*', // Allow all for now
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = this.extractToken(client);
      if (!token) throw new Error('No token');
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.SUPABASE_JWT_SECRET || 'super-secret-jwt-key',
      });
      (client as any).user = payload;

      client.join('global');
    } catch (e) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {}

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { content: string },
  ) {
    const user = (client as any).user;

    if (!payload.content || payload.content.length > 500) return;

    this.server.to('global').emit('chat:broadcast', {
      sender: user.username || user.email || 'Unknown',
      userId: user.userId,
      content: payload.content,
      timestamp: new Date().toISOString(),
    });
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
