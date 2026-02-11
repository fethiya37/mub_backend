import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApplicantDocumentTypes } from './enums.dto';
import type { ApplicantDocumentType } from './enums.dto';

export class ApplicantDocumentDto {
  @ApiProperty({
    example: 'PASSPORT',
    enum: ApplicantDocumentTypes,
    description:
      'Allowed values: PASSPORT | PERSONAL_PHOTO | COC_CERTIFICATE | APPLICANT_ID | OTHER'
  })
  @IsIn(ApplicantDocumentTypes)
  documentType!: ApplicantDocumentType;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description:
      'Upload file when using multipart/form-data. Field name should match document_<TYPE> if using dynamic upload.'
  })
  @IsOptional()
  file?: any;

  @ApiProperty({
    example: '/uploads/applicants/documents/passport-uuid.pdf',
    description:
      'Relative file URL saved after upload. Example paths provided below.'
  })
  @IsString()
  fileUrl!: string;

  @ApiPropertyOptional({
    example: 'PENDING',
    description: 'Optional review status'
  })
  @IsOptional()
  @IsString()
  status?: string;
}
