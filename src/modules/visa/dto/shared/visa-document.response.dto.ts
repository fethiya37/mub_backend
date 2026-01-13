import { ApiProperty } from '@nestjs/swagger';
import { VisaDocumentTypes, VisaDocumentVerificationStatuses } from './visa.enums.dto';

export class VisaDocumentResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  visaApplicationId!: string;

  @ApiProperty({ enum: VisaDocumentTypes })
  documentType!: string;

  @ApiProperty()
  fileUrl!: string;

  @ApiProperty({ required: false })
  fileHash?: string | null;

  @ApiProperty()
  versionNumber!: number;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty({ enum: VisaDocumentVerificationStatuses })
  verificationStatus!: string;

  @ApiProperty({ required: false })
  verificationReason?: string | null;

  @ApiProperty({ required: false, format: 'uuid' })
  verifiedByAdminId?: string | null;

  @ApiProperty({ required: false })
  verifiedAt?: string | null;

  @ApiProperty({ required: false, format: 'uuid' })
  uploadedByAdminId?: string | null;

  @ApiProperty()
  uploadedAt!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
