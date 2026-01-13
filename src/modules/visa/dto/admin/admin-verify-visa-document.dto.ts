import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { VisaDocumentVerificationStatuses } from '../shared/visa.enums.dto';

export class AdminVerifyVisaDocumentDto {
  @ApiProperty({ enum: VisaDocumentVerificationStatuses })
  @IsString()
  verificationStatus!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
