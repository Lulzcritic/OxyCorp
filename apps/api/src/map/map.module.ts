import { Module } from '@nestjs/common';
import { MapController } from './map.controller';
import { MapService } from './map.service';
import { MapSpawningService } from './map.spawning.service';
import { PrismaModule } from '../prisma/prisma.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [PrismaModule, SkillsModule],
  controllers: [MapController],
  providers: [MapService, MapSpawningService],
  exports: [MapService, MapSpawningService],
})
export class MapModule {}

