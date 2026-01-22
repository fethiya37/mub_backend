import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AgencyGenerateCvDto {
  @ApiPropertyOptional({ required: false, example: 'cv-uuid-123' })
  @IsOptional()
  @IsString()
  cvId?: string;

  @ApiPropertyOptional({ required: false, example: 'job-uuid-123' })
  @IsOptional()
  @IsString()
  jobId?: string;
}
