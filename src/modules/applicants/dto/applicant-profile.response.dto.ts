import { ApiProperty } from '@nestjs/swagger';

export class ApplicantProfileResponseDto {
  @ApiProperty() applicantId!: string;
  @ApiProperty({ nullable: true }) userId!: string | null;
  @ApiProperty() phone!: string;
  @ApiProperty({ nullable: true }) email!: string | null;
  @ApiProperty() profileStatus!: string;
  @ApiProperty({ nullable: true }) firstName!: string | null;
  @ApiProperty({ nullable: true }) lastName!: string | null;
  @ApiProperty({ nullable: true }) passportNumber!: string | null;
  @ApiProperty({ nullable: true }) submittedAt!: string | null;
  @ApiProperty({ nullable: true }) verifiedAt!: string | null;
  @ApiProperty({ nullable: true }) rejectionReason!: string | null;
}
