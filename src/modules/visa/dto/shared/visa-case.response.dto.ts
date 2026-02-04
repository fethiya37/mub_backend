import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VisaCaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiPropertyOptional()
  partnerId?: string | null;

  @ApiPropertyOptional()
  jobId?: string | null;

  @ApiProperty()
  destinationCountry!: string;

  @ApiProperty({ example: 'INITIATED' })
  status!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  caseManagerUserId!: string;

  @ApiPropertyOptional()
  sponsorId?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
