import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GenerateCvDto {
  @ApiPropertyOptional({ required: false, description: 'If provided, forces regeneration for this cvId', example: 'cv-uuid-123' })
  @IsOptional()
  @IsString()
  cvId?: string;

  @ApiPropertyOptional({ required: false, description: 'Optional job id (if cvId not provided)', example: 'job-uuid-123' })
  @IsOptional()
  @IsString()
  jobId?: string;
}
