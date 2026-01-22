import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AgencyCreateCvDraftDto {
  @ApiProperty({ description: 'Target applicant', example: 'applicant-uuid-123' })
  @IsString()
  applicantId!: string;

  @ApiProperty({ required: false, description: 'Optional JobPosting.id', example: 'job-uuid-123' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiProperty({ required: false, description: 'Optional summary', example: 'Experienced cleaner with 2 years...' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  summary?: string;
}
