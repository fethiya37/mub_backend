import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class ApplicantQualificationDto {
  @ApiProperty({ example: 'COC Level III' })
  @IsString()
  @MinLength(2)
  qualificationType!: string;

  @ApiPropertyOptional({ example: 'TVET College Addis Ababa' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 'Ethiopia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 2022 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  yearCompleted?: number;
}
