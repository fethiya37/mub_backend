import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export const PerformanceReportTypes = ['AGENCY', 'STAFF', 'BOTH'] as const;
export type PerformanceReportType = (typeof PerformanceReportTypes)[number];

export class PerformanceReportQueryDto {
  @ApiPropertyOptional({ description: 'ISO date string (inclusive)', example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'ISO date string (inclusive)', example: '2026-01-31T23:59:59.999Z' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ enum: PerformanceReportTypes, default: 'BOTH' })
  @IsOptional()
  @IsIn(PerformanceReportTypes)
  type?: PerformanceReportType;
}
