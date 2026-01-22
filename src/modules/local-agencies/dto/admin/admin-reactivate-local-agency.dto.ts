import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminReactivateLocalAgencyDto {
  @ApiPropertyOptional({ example: 'Issue resolved after compliance review' })
  @IsOptional()
  @IsString()
  reason?: string;
}
