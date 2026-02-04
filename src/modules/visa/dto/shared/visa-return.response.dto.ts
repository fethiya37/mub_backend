import { ApiProperty } from '@nestjs/swagger';

export class VisaReturnResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  visaCaseId!: string;

  @ApiProperty()
  reason!: string;

  @ApiProperty()
  returnedAt!: string;

  @ApiProperty()
  createdAt!: string;
}
