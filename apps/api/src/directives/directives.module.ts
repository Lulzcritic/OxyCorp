import { Module } from '@nestjs/common';
import { DirectivesService } from './directives.service';
import { DirectivesController } from './directives.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DirectivesController],
  providers: [DirectivesService],
  exports: [DirectivesService], // Exported for Event Listeners later
})
export class DirectivesModule {}
