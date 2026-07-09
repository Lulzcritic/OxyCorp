import { Module } from '@nestjs/common';
import { RpgService } from './rpg.service';
import { RpgController } from './rpg.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RpgController],
  providers: [RpgService],
  exports: [RpgService],
})
export class RpgModule {}
