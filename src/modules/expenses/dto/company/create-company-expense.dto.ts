import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength, ValidateIf, IsNumberString } from 'class-validator';

export class CreateCompanyExpenseDto {
  @ApiPropertyOptional({ example: 'uuid-expense-type-id', nullable: true, description: 'Null means Other' })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional({ example: 'Other: Office snacks', nullable: true })
  @ValidateIf((o) => !o.typeId)
  @IsString()
  @MinLength(2)
  typeNameOther?: string;

  @ApiProperty({ example: '1500.00', description: 'Decimal string' })
  @IsNumberString()
  amount!: string;

  @ApiProperty({ example: '2026-02-03' })
  @IsDateString()
  expenseDate!: string;

  @ApiPropertyOptional({ example: 'RCPT-000123' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({ example: 'Fuel for field visit' })
  @IsOptional()
  @IsString()
  description?: string;
}
