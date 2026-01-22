import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { ContractTypes } from './shared/enums.dto';
import type { ContractType } from './shared/enums.dto';

export class CreateJobDto {
  @ApiProperty({ example: 'Housekeeper' })
  @IsString()
  @MinLength(2)
  jobTitle!: string;

  @ApiProperty({ example: 'We are hiring a housekeeper for a family in Riyadh. Duties include cleaning, laundry, and basic meal prep.' })
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

  @ApiProperty({ enum: ContractTypes, example: 'FULL_TIME' })
  @IsIn(ContractTypes)
  contractType!: ContractType;

  @ApiPropertyOptional({ enum: ['DRAFT', 'ACTIVE'], example: 'DRAFT' })
  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE'])
  status?: 'DRAFT' | 'ACTIVE';
}
