import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class VerifyApplicantDto {
  @ApiPropertyOptional({ example: 'Verified after reviewing documents' })
  @IsOptional()
  @IsString()
  note?: string;
}
