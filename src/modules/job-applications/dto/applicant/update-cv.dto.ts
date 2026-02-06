import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCvDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  cv?: any;

  @ApiPropertyOptional({ example: '/uploads/job-applications/cv/cv.pdf', nullable: true })
  @IsOptional()
  @IsString()
  cvFileUrl?: string | null;
}
