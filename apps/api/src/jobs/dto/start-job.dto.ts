import { IsEnum, IsString, IsOptional } from 'class-validator';
import { JobType } from '@prisma/client';

export class StartJobDto {
  @IsEnum(JobType)
  type: JobType;

  @IsString()
  resource: string;

  @IsString()
  @IsOptional()
  sectorId?: string;
}
