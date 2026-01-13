import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';
import { CV_STATUS } from '../shared/cv.enums.dto';

export class AdminUpdateCvStatusDto {
  @ApiProperty({ enum: [CV_STATUS.approved, CV_STATUS.rejected] })
  @IsString()
  @IsIn([CV_STATUS.approved, CV_STATUS.rejected])
  status!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  comments?: string;
}
