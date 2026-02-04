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

  @ApiProperty({ example: 'APP-2025-000123' })
  applicationNumber!: string;

  @ApiProperty({ example: 'DRAFT' })
  profileStatus!: string;

  @ApiPropertyOptional({ example: 'SELF', nullable: true })
  registrationSource!: string | null;

  @ApiPropertyOptional({ example: 'uuid-staff-user-id', nullable: true })
  createdBy!: string | null;

  @ApiPropertyOptional({ example: 'Fetiya', nullable: true })
  firstName!: string | null;

  @ApiPropertyOptional({ example: 'Seid', nullable: true })
  middleName!: string | null;

  @ApiPropertyOptional({ example: 'Seid', nullable: true })
  lastName!: string | null;

  @ApiPropertyOptional({ example: 'FEMALE', nullable: true })
  gender!: string | null;

  @ApiPropertyOptional({ example: '1998-01-15', nullable: true })
  dateOfBirth!: string | null;

  @ApiPropertyOptional({ example: 'Addis Ababa', nullable: true })
  placeOfBirth!: string | null;

  @ApiPropertyOptional({ example: 'Ethiopian', nullable: true })
  nationality!: string | null;

  @ApiPropertyOptional({ example: 'Islam', nullable: true })
  religion!: string | null;

  @ApiPropertyOptional({ example: 'SINGLE', nullable: true })
  maritalStatus!: string | null;

  @ApiPropertyOptional({ example: 0, nullable: true })
  numberOfChildren!: number | null;

  @ApiPropertyOptional({ example: 165, nullable: true })
  height!: number | null;

  @ApiPropertyOptional({ example: 58, nullable: true })
  weight!: number | null;

  @ApiPropertyOptional({ example: 'Bole, Addis Ababa, Ethiopia', nullable: true })
  address!: string | null;

  @ApiPropertyOptional({ example: 'EF12345678', nullable: true })
  laborId!: string | null;

  @ApiPropertyOptional({ example: 'P12345678', nullable: true })
  passportNumber!: string | null;

  @ApiPropertyOptional({ example: 'Addis Ababa', nullable: true })
  passportPlace!: string | null;

  @ApiPropertyOptional({ example: '2020-01-01', nullable: true })
  passportIssueDate!: string | null;

  @ApiPropertyOptional({ example: '2030-12-31', nullable: true })
  passportExpiry!: string | null;

  @ApiPropertyOptional({ example: '2025-12-30T10:00:00.000Z', nullable: true })
  submittedAt!: string | null;

  @ApiPropertyOptional({ example: 'uuid-verifier-user-id', nullable: true })
  verifiedBy!: string | null;

  @ApiPropertyOptional({ example: '2025-12-30T12:00:00.000Z', nullable: true })
  verifiedAt!: string | null;

  @ApiPropertyOptional({ example: 'Missing COC certificate', nullable: true })
  rejectionReason!: string | null;

  @ApiProperty({ example: '2025-12-29T08:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-12-30T09:00:00.000Z' })
  updatedAt!: string;
}
