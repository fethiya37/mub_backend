import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ListApplicantExpensesQueryDto {
  @ApiPropertyOptional({ example: 'uuid-applicantId' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  applicantId?: string;

  @ApiPropertyOptional({ example: 'uuid-expense-type-id' })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional({ example: '2026-02-01' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ example: '2026-02-28' })
  @IsOptional()
  @IsString()
  to?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsString()
  pageSize?: string;
}
