import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MapModule } from '../map/map.module';
import { CombatModule } from '../combat/combat.module';
import { GameTickService } from './gametick.service';
import { GameTickController } from './gametick.controller';

@Module({
  imports: [PrismaModule, MapModule, CombatModule],
  providers: [GameTickService],
  controllers: [GameTickController],
  exports: [GameTickService],
})
export class GameTickModule {}
