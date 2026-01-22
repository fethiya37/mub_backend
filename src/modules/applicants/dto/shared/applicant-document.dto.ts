import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApplicantDocumentTypes } from './enums.dto';
import type { ApplicantDocumentType } from './enums.dto';

export class ApplicantDocumentDto {
  @ApiProperty({ example: 'PASSPORT', enum: ApplicantDocumentTypes })
  @IsIn(ApplicantDocumentTypes)
  documentType!: ApplicantDocumentType;

  @ApiProperty({ example: 'https://files.example.com/applicants/uuid/passport.pdf' })
  @IsString()
  fileUrl!: string;

  @ApiPropertyOptional({ example: 'PENDING', description: 'Optional verification status managed by admin workflow' })
  @IsOptional()
  @IsString()
  verificationStatus?: string;
}
