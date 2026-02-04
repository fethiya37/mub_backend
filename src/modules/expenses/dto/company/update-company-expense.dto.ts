import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength, ValidateIf, IsNumberString } from 'class-validator';

export class UpdateCompanyExpenseDto {
  @ApiPropertyOptional({ example: 'uuid-expense-type-id', nullable: true })
  @IsOptional()
  @IsUUID()
  typeId?: string | null;

  @ApiPropertyOptional({ example: 'Other: Cleaning materials', nullable: true })
  @ValidateIf((o) => o.typeId === null)
  @IsString()
  @MinLength(2)
  typeNameOther?: string | null;

  @ApiPropertyOptional({ example: '2500.00' })
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @ApiPropertyOptional({ example: '2026-02-03' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ example: 'RCPT-000123' })
  @IsOptional()
  @IsString()
  referenceNo?: string | null;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
