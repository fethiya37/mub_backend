import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';
import { VisaAttemptStatuses } from '../shared/enums.dto';

export class AdminCreateVisaAttemptDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiProperty({ enum: VisaAttemptStatuses, example: 'ISSUED' })
  @IsIn(VisaAttemptStatuses)
  status!: 'ISSUED' | 'REJECTED';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  applicationNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  visaNumber?: string;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  issuedAt?: string;

  @ApiPropertyOptional({ example: '2027-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  expiresAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  rejectionReason?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  barcodeValue?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl()
  barcodeImageUrl?: string;
}
