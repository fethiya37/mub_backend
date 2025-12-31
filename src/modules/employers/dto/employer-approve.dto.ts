import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EmployerApproveDto {
  @ApiPropertyOptional({ example: 'Approved after review' })
  @IsOptional()
  @IsString()
  reason?: string;
}
