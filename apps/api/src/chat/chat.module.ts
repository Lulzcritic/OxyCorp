import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    JwtModule, // Needed for WsJwtGuard logic if we inject JwtService directly or use Auth logic
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
