import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class ApplicantWorkExperienceDto {
  @ApiProperty({ example: 'Housekeeper' })
  @IsString()
  @MinLength(2)
  jobTitle!: string;

  @ApiPropertyOptional({ example: 'Private Employer' })
  @IsOptional()
  @IsString()
  employerName?: string;

  @ApiPropertyOptional({ example: 'Saudi Arabia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: '2021-01-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2023-01-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Cleaning, laundry, cooking' })
  @IsOptional()
  @IsString()
  responsibilities?: string;
}
