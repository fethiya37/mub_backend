import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { CV_SECTIONS } from './cv.enums.dto';

export class CvSectionDto {
  @ApiProperty({ enum: Object.values(CV_SECTIONS), example: 'summary' })
  @IsString()
  sectionName!: string;

  @ApiProperty({ default: true, example: true })
  @IsBoolean()
  isEnabled!: boolean;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  displayOrder!: number;

  @ApiProperty({ required: false, description: 'JSON payload for custom content per section', example: { text: 'Short summary...' } })
  @IsOptional()
  @IsObject()
  customContent?: Record<string, any>;
}
