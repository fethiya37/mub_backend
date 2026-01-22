import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCvDraftDto {
  @ApiPropertyOptional({ required: false, description: 'Optional JobPosting.id', example: 'job-uuid-123' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiPropertyOptional({ required: false, description: 'Job-specific summary for this CV', example: 'Experienced caregiver with 3+ years...' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  summary?: string;
}
