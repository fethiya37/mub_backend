import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class AdminApproveLocalAgencyDto {
  @ApiPropertyOptional({ example: 'License verified and contact details confirmed' })
  @IsOptional()
  @IsString()
  reason?: string;
}
