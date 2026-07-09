import { Module } from '@nestjs/common';
import { CartridgesController } from './cartridges.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CartridgesController],
})
export class CartridgesModule {}