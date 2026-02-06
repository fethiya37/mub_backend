import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateApplicationDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  applicantId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  jobPostingId!: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  cv?: any;

  @ApiPropertyOptional({ example: '/uploads/job-applications/cv/cv.pdf', nullable: true })
  @IsOptional()
  @IsString()
  cvFileUrl?: string | null;
}
