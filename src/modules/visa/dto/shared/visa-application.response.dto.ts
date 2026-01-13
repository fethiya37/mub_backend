import { ApiProperty } from '@nestjs/swagger';
import { VisaStatuses } from './visa.enums.dto';
import { VisaDocumentResponseDto } from './visa-document.response.dto';
import { VisaComplianceResponseDto } from './visa-compliance.response.dto';
import { VisaStatusHistoryResponseDto } from './visa-status-history.response.dto';
import { VisaNotificationResponseDto } from './visa-notification.response.dto';

export class VisaApplicationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  applicantId!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  employerId?: string | null;

  @ApiProperty({ required: false, format: 'uuid' })
  jobId?: string | null;

  @ApiProperty()
  visaType!: string;

  @ApiProperty()
  destinationCountry!: string;

  @ApiProperty({ required: false })
  applicationReference?: string | null;

  @ApiProperty({ enum: VisaStatuses })
  status!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  assignedCaseOfficerId?: string | null;

  @ApiProperty({ required: false, format: 'uuid' })
  submittedByAdminId?: string | null;

  @ApiProperty({ required: false })
  submissionDate?: string | null;

  @ApiProperty({ required: false })
  decisionDate?: string | null;

  @ApiProperty({ required: false })
  visaIssueDate?: string | null;

  @ApiProperty({ required: false })
  visaExpiryDate?: string | null;

  @ApiProperty({ required: false })
  remarks?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;

  @ApiProperty({ type: () => [VisaDocumentResponseDto], required: false })
  documents?: VisaDocumentResponseDto[];

  @ApiProperty({ type: () => [VisaComplianceResponseDto], required: false })
  compliance?: VisaComplianceResponseDto[];

  @ApiProperty({ type: () => [VisaStatusHistoryResponseDto], required: false })
  statusHistory?: VisaStatusHistoryResponseDto[];

  @ApiProperty({ type: () => [VisaNotificationResponseDto], required: false })
  notifications?: VisaNotificationResponseDto[];
}
