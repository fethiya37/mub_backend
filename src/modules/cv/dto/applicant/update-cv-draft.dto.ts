import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { CvSectionDto } from '../shared/cv-section.dto';

export class UpdateCvDraftDto {
  @ApiPropertyOptional({ required: false, example: 'Updated professional summary...' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  summary?: string;

  @ApiPropertyOptional({ required: false, type: [CvSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CvSectionDto)
  sections?: CvSectionDto[];
}
