import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCvDraftDto {
  @ApiProperty({ required: false, description: 'Optional JobPosting.id' })
  @IsOptional()
  @IsString()
  jobId?: string;

  @ApiProperty({ required: false, description: 'Job-specific summary for this CV' })
  @IsOptional()
  @IsString()
  @MinLength(5)
  summary?: string;
}
