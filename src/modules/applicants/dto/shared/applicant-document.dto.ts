import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApplicantDocumentTypes } from './enums.dto';
import type { ApplicantDocumentType } from './enums.dto';

export class ApplicantDocumentDto {
  @ApiProperty({ example: 'PASSPORT', enum: ApplicantDocumentTypes })
  @IsIn(ApplicantDocumentTypes)
  documentType!: ApplicantDocumentType;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  file?: any;

  @ApiProperty({ example: '/uploads/applicants/uuid/passport.pdf' })
  @IsString()
  fileUrl!: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;
}
