import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CvSectionDto } from '../shared/cv-section.dto';

export class UpdateCvDraftDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(5)
  summary?: string;

  @ApiProperty({ required: false, type: [CvSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CvSectionDto)
  sections?: CvSectionDto[];
}
