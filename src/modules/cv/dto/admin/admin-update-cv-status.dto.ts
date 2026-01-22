import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { CV_STATUS } from '../shared/cv.enums.dto';

export class AdminUpdateCvStatusDto {
  @ApiProperty({ enum: [CV_STATUS.approved, CV_STATUS.rejected], example: CV_STATUS.approved })
  @IsString()
  @IsIn([CV_STATUS.approved, CV_STATUS.rejected])
  status!: string;

  @ApiPropertyOptional({ required: false, example: 'Approved after review' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  comments?: string;
}
