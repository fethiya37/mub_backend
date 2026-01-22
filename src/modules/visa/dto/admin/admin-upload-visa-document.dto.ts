import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { VisaDocumentTypes } from '../shared/visa.enums.dto';

export class AdminUploadVisaDocumentDto {
  @ApiProperty({ enum: VisaDocumentTypes })
  @IsString()
  documentType!: string;

  @ApiProperty({ example: 'https://files.example.com/passport.pdf' })
  @IsString()
  @MinLength(5)
  fileUrl!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fileHash?: string;
}
