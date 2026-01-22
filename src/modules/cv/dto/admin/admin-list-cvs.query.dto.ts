import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { CV_STATUS } from '../shared/cv.enums.dto';

export class AdminListCvsQueryDto {
  @ApiPropertyOptional({ enum: Object.values(CV_STATUS), example: CV_STATUS.submitted })
  @IsOptional()
  @IsIn(Object.values(CV_STATUS))
  status?: string;

  @ApiPropertyOptional({ example: 'applicant-uuid-123' })
  @IsOptional()
  @IsString()
  applicantId?: string;

  @ApiPropertyOptional({ example: 'job-uuid-123' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;
}
