import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ToInt } from './transforms';

export class ApplicantWorkExperienceDto {
  @ApiProperty({ example: 'Construction Electrician' })
  @IsString()
  @MinLength(2)
  jobTitle!: string;

  @ApiPropertyOptional({ example: 'Qatar' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @ToInt()
  @IsInt()
  @Min(0)
  yearsWorked?: number;
}
