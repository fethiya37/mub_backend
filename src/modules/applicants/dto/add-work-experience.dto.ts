import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class AddWorkExperienceDto {
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

  @ApiPropertyOptional({ example: '2022-01-01' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  responsibilities?: string;
}
