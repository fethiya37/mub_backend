import { ApiProperty } from '@nestjs/swagger';

export class VisaFingerprintResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiProperty()
  isDone!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
