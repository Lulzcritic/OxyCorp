import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MapModule } from '../map/map.module';
import { GameTickService } from './gametick.service';
import { GameTickController } from './gametick.controller';

@Module({
  imports: [PrismaModule, MapModule],
  providers: [GameTickService],
  controllers: [GameTickController],
  exports: [GameTickService],
})
export class GameTickModule {}
