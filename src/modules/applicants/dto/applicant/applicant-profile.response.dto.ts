import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ApplicantProfileResponseDto {
  @ApiProperty({ example: 'uuid-applicant-id' })
  applicantId!: string;

  @ApiPropertyOptional({ example: 'uuid-user-id', nullable: true })
  userId!: string | null;

  @ApiProperty({ example: '+251911111111' })
  phone!: string;

  @ApiPropertyOptional({ example: 'applicant@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: 'DRAFT' })
  profileStatus!: string;

  @ApiPropertyOptional({ example: 'Fetiya', nullable: true })
  firstName!: string | null;

  @ApiPropertyOptional({ example: 'Seid', nullable: true })
  lastName!: string | null;

  @ApiPropertyOptional({ example: 'P12345678', nullable: true })
  passportNumber!: string | null;

  @ApiPropertyOptional({ example: 'EF12345678', nullable: true })
  laborId!: string | null;

  @ApiPropertyOptional({ example: 'Addis Ababa', nullable: true })
  region!: string | null;

  @ApiPropertyOptional({ example: '2025-12-30T10:00:00.000Z', nullable: true })
  submittedAt!: string | null;

  @ApiPropertyOptional({ example: '2025-12-30T12:00:00.000Z', nullable: true })
  verifiedAt!: string | null;

  @ApiPropertyOptional({ example: 'Missing COC certificate', nullable: true })
  rejectionReason!: string | null;
}
