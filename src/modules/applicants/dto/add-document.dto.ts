import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AddDocumentDto {
  @ApiProperty({ example: 'PASSPORT' })
  @IsString()
  @MinLength(2)
  documentType!: string;

  @ApiProperty({ example: 'https://files.example/passport.pdf' })
  @IsString()
  fileUrl!: string;

  @ApiPropertyOptional({ example: 'PENDING' })
  @IsOptional()
  @IsString()
  verificationStatus?: string;
}
