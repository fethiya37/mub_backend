import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

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
  @IsInt()
  @Min(0)
  yearsWorked?: number;
}
