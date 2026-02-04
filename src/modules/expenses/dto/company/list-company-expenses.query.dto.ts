import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class ListCompanyExpensesQueryDto {
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
