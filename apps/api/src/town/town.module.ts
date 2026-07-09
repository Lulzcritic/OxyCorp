import { Module } from '@nestjs/common';
import { TownGateway } from './town.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  providers: [TownGateway],
  exports: [TownGateway],
})
export class TownModule {}
