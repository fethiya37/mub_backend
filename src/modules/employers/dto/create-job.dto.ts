import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ContractTypes, JobStatuses } from './shared/enums.dto';
import type { ContractType, JobStatus } from './shared/enums.dto';

export class CreateJobDto {
  @ApiProperty({ example: 'Housekeeper' })
  @IsString()
  @MinLength(2)
  jobTitle!: string;

  @ApiProperty({ example: 'Full job description...' })
  @IsString()
  @MinLength(10)
  jobDescription!: string;

  @ApiProperty({ example: 'Saudi Arabia' })
  @IsString()
  @MinLength(2)
  country!: string;

  @ApiPropertyOptional({ example: 'Riyadh' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '1500-2000 SAR' })
  @IsOptional()
  @IsString()
  salaryRange?: string;

  @ApiProperty({ enum: ContractTypes })
  @IsIn(ContractTypes)
  contractType!: ContractType;

  @ApiPropertyOptional({ enum: ['DRAFT', 'ACTIVE'], example: 'DRAFT' })
  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE'])
  status?: Extract<JobStatus, 'DRAFT' | 'ACTIVE'>;
}
