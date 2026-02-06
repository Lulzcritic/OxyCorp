import { Module } from '@nestjs/common';
import { BunkerService } from './bunker.service';
import { BunkerController } from './bunker.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BunkerController],
  providers: [BunkerService],
  exports: [BunkerService],
})
export class BunkerModule {}
