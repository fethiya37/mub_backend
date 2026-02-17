import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, IsString, IsUUID } from 'class-validator';

export const ApplicantsBySourceExportTypes = ['excel', 'pdf'] as const;
export type ApplicantsBySourceExportType = (typeof ApplicantsBySourceExportTypes)[number];

export class ApplicantsBySourceQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ example: '2026-01-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiPropertyOptional({ example: 'uuid-user-id', description: 'Creator userId (Agency user or Staff/Admin user)' })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsString()
  pageSize?: string;

  @ApiPropertyOptional({ example: 'excel', enum: ApplicantsBySourceExportTypes })
  @IsOptional()
  @IsIn(ApplicantsBySourceExportTypes)
  export?: ApplicantsBySourceExportType;
}
