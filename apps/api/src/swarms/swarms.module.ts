import { Module } from '@nestjs/common';
import { SwarmsService } from './swarms.service';
import { SwarmsController } from './swarms.controller';
import { PrismaService } from '../prisma/prisma.service';
import { BunkerModule } from '../bunker/bunker.module';

@Module({
  imports: [BunkerModule],
  controllers: [SwarmsController],
  providers: [SwarmsService, PrismaService],
})
export class SwarmsModule {}

