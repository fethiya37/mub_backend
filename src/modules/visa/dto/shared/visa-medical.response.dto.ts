import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VisaMedicalResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiProperty()
  reportFileUrl!: string;

  @ApiProperty({ example: 'FIT' })
  result!: string;

  @ApiPropertyOptional()
  expiresAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
