import { Module } from '@nestjs/common';
import { CraftingService } from './crafting.service';
import { CraftingController } from './crafting.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [PrismaModule, SkillsModule],
  controllers: [CraftingController],
  providers: [CraftingService],
  exports: [CraftingService],
})
export class CraftingModule {}
