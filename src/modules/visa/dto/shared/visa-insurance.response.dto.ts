import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VisaInsuranceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiPropertyOptional()
  providerName?: string | null;

  @ApiPropertyOptional()
  policyNumber?: string | null;

  @ApiPropertyOptional()
  policyFileUrl?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
