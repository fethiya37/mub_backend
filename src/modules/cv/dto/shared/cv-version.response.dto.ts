import { ApiProperty } from '@nestjs/swagger';

export class CvVersionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  versionNumber!: number;

  @ApiProperty()
  pdfUrl!: string;

  @ApiProperty()
  isFinal!: boolean;

  @ApiProperty()
  createdAt!: string;
}
