import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class AddQualificationDto {
  @ApiProperty({ example: 'Diploma' })
  @IsString()
  @MinLength(2)
  qualificationType!: string;

  @ApiPropertyOptional({ example: 'TVET College' })
  @IsOptional()
  @IsString()
  institution?: string;

  @ApiPropertyOptional({ example: 'Ethiopia' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(1900)
  yearCompleted?: number;
}
