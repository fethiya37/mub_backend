import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VisaAttemptResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiProperty()
  attemptNumber!: number;

  @ApiProperty({ example: 'ISSUED' })
  status!: string;

  @ApiPropertyOptional()
  applicationNumber?: string | null;

  @ApiPropertyOptional()
  visaNumber?: string | null;

  @ApiPropertyOptional()
  issuedAt?: string | null;

  @ApiPropertyOptional()
  expiresAt?: string | null;

  @ApiPropertyOptional()
  rejectionReason?: string | null;

  @ApiPropertyOptional()
  barcodeValue?: string | null;

  @ApiPropertyOptional()
  barcodeImageUrl?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
