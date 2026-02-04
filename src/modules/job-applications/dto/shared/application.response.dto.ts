import { ApiProperty } from '@nestjs/swagger';

export class ApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobPostingId!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty()
  cvFileUrl!: string;

  @ApiProperty({ example: 'PENDING' })
  status!: string;
}
