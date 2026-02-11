import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VisaCaseResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  applicantId!: string;

  @ApiPropertyOptional()
  applicantName?: string | null;

  @ApiPropertyOptional()
  partnerId?: string | null;

  @ApiPropertyOptional()
  partnerName?: string | null;

  @ApiPropertyOptional()
  jobId?: string | null;

  @ApiPropertyOptional()
  jobTitle?: string | null;

  @ApiProperty()
  destinationCountry!: string;

  @ApiProperty({ example: 'INITIATED' })
  status!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  caseManagerUserId!: string;

  @ApiPropertyOptional()
  caseManagerName?: string | null;

  @ApiPropertyOptional()
  sponsorId?: string | null;

  @ApiPropertyOptional()
  sponsorName?: string | null;

  @ApiProperty({ isArray: true, example: ['MEDICAL', 'INSURANCE'] })
  completedStatuses!: string[];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
