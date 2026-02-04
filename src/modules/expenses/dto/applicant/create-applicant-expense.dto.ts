import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MinLength, ValidateIf, IsNumberString } from 'class-validator';

export class CreateApplicantExpenseDto {
  @ApiProperty({ example: 'uuid-applicantProfile-applicantId' })
  @IsString()
  @MinLength(1)
  applicantId!: string;

  @ApiPropertyOptional({ example: 'uuid-expense-type-id', nullable: true, description: 'Null means Other' })
  @IsOptional()
  @IsUUID()
  typeId?: string;

  @ApiPropertyOptional({ example: 'Other: Extra documents', nullable: true })
  @ValidateIf((o) => !o.typeId)
  @IsString()
  @MinLength(2)
  typeNameOther?: string;

  @ApiProperty({ example: '800.00', description: 'Decimal string' })
  @IsNumberString()
  amount!: string;

  @ApiProperty({ example: '2026-02-03' })
  @IsDateString()
  expenseDate!: string;

  @ApiPropertyOptional({ example: 'REF-123' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({ example: 'Medical check payment' })
  @IsOptional()
  @IsString()
  description?: string;
}
