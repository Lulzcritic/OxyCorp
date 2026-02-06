import { Module } from '@nestjs/common';
import { RefiningService } from './refining.service';
import { RefiningController } from './refining.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [PrismaModule, SkillsModule],
  controllers: [RefiningController],
  providers: [RefiningService],
})
export class RefiningModule {}
