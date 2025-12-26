import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyApplicantProfileDto {
  @ApiPropertyOptional({ example: 'Verified after document review' })
  @IsOptional()
  @IsString()
  note?: string;
}
