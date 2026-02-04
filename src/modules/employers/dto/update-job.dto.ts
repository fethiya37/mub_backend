import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, IsUrl, Min, MinLength } from 'class-validator';
import { ContractTypes, JobStatuses } from './shared/enums.dto';
import type { ContractType, JobStatus } from './shared/enums.dto';

export class UpdateJobDto {
  @ApiPropertyOptional({ example: 'Housekeeper' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  jobTitle?: string;

  @ApiPropertyOptional({ example: 'Updated description with more details...' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  jobDescription?: string;

  @ApiPropertyOptional({ example: 'Saudi Arabia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'Riyadh' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '1600-2200 SAR' })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiPropertyOptional({ example: 'https://cdn.site.com/job-thumb.png' })
  @IsOptional()
  @IsString()
  @IsUrl()
  thumbnailUrl?: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(1)
  vacancies?: number;

  @ApiPropertyOptional({ enum: ContractTypes, example: 'FULL_TIME' })
  @IsOptional()
  @IsIn(ContractTypes)
  contractType?: ContractType;

  @ApiPropertyOptional({ enum: JobStatuses, example: 'ACTIVE' })
  @IsOptional()
  @IsIn(JobStatuses)
  status?: JobStatus;
}
