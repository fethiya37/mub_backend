import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { CV_SECTIONS } from './cv.enums.dto';

export class CvSectionDto {
  @ApiProperty({ enum: Object.values(CV_SECTIONS) })
  @IsString()
  sectionName!: string;

  @ApiProperty({ default: true })
  @IsBoolean()
  isEnabled!: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  displayOrder!: number;

  @ApiProperty({ required: false, description: 'JSON payload for custom content per section' })
  @IsOptional()
  @IsObject()
  customContent?: Record<string, any>;
}
