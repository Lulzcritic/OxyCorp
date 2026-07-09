import { Module } from '@nestjs/common';
import { CombatService } from './combat.service';
import { CombatController } from './combat.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CombatController],
  providers: [CombatService, PrismaService],
  exports: [CombatService],
})
export class CombatModule {}
