import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsOptional, IsString } from 'class-validator';

export class AdminRecordVisaDecisionDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsString()
  decision!: 'APPROVED' | 'REJECTED';

  @ApiProperty({ required: false, description: 'Required when REJECTED' })
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiProperty({ required: false, description: 'Required when APPROVED (ISO date)' })
  @IsOptional()
  @IsISO8601()
  visaIssueDate?: string;

  @ApiProperty({ required: false, description: 'Required when APPROVED (ISO date)' })
  @IsOptional()
  @IsISO8601()
  visaExpiryDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
