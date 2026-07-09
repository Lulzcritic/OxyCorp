import { Module } from '@nestjs/common';
import { CompanyAIService } from './company-ai.service';
import { CompanyAIController } from './company-ai.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyAIController],
  providers: [CompanyAIService],
  exports: [CompanyAIService],
})
export class CompanyAIModule {}