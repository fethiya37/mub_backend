import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ContractTypes, JobStatuses } from './shared/enums.dto';
import type { ContractType, JobStatus } from './shared/enums.dto';

export class UpdateJobDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  jobDescription?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiPropertyOptional({ enum: ContractTypes })
  @IsOptional()
  @IsIn(ContractTypes)
  contractType?: ContractType;

  @ApiPropertyOptional({ enum: JobStatuses })
  @IsOptional()
  @IsIn(JobStatuses)
  status?: JobStatus;
}
