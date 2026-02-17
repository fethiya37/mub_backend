import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export const VisaMedicalScope = ['ALL', 'ACTIVE_ONLY'] as const;
export type VisaMedicalScopeType = (typeof VisaMedicalScope)[number];

export class VisaMedicalReportQueryDto {
  @ApiPropertyOptional({ description: 'ISO date string (inclusive)', example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date string (inclusive)', example: '2026-01-31T23:59:59.999Z' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ enum: VisaMedicalScope, default: 'ACTIVE_ONLY' })
  @IsOptional()
  @IsIn(VisaMedicalScope)
  scope?: VisaMedicalScopeType;
}
