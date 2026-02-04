import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength, ValidateIf, IsNumberString } from 'class-validator';

export class UpdateApplicantExpenseDto {
  @ApiPropertyOptional({ example: 'uuid-applicantProfile-applicantId' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  applicantId?: string;

  @ApiPropertyOptional({ example: 'uuid-expense-type-id', nullable: true })
  @IsOptional()
  @IsUUID()
  typeId?: string | null;

  @ApiPropertyOptional({ example: 'Other: Replacement ID', nullable: true })
  @ValidateIf((o) => o.typeId === null)
  @IsString()
  @MinLength(2)
  typeNameOther?: string | null;

  @ApiPropertyOptional({ example: '1200.00' })
  @IsOptional()
  @IsNumberString()
  amount?: string;

  @ApiPropertyOptional({ example: '2026-02-03' })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({ example: 'REF-123' })
  @IsOptional()
  @IsString()
  referenceNo?: string | null;

  @ApiPropertyOptional({ example: 'Updated note' })
  @IsOptional()
  @IsString()
  description?: string | null;
}
