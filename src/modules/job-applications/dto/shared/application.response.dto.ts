import { ApiProperty } from '@nestjs/swagger';

export class ApplicationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  jobPostingId!: string;

  @ApiProperty()
  jobTitle!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiProperty()
  applicantName!: string;

  @ApiProperty()
  cvFileUrl!: string;

  @ApiProperty({ example: 'PENDING' })
  status!: string;
}
