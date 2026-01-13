import { ApiProperty } from '@nestjs/swagger';

export const VisaStatuses = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'ADDITIONAL_DOCUMENTS_REQUIRED',
  'EMBASSY_PROCESSING',
  'APPROVED',
  'REJECTED',
  'EXPIRED',
  'WITHDRAWN'
] as const;

export type VisaStatus = (typeof VisaStatuses)[number];

export const VisaDocumentTypes = [
  'PASSPORT',
  'MEDICAL_CLEARANCE',
  'POLICE_CLEARANCE',
  'EMPLOYMENT_CONTRACT',
  'INVITATION_LETTER',
  'EMBASSY_FORMS',
  'OTHER'
] as const;

export type VisaDocumentType = (typeof VisaDocumentTypes)[number];

export const VisaDocumentVerificationStatuses = ['PENDING', 'VERIFIED', 'REJECTED'] as const;
export type VisaDocumentVerificationStatus = (typeof VisaDocumentVerificationStatuses)[number];

export const VisaComplianceStatuses = ['PENDING', 'COMPLETED', 'FAILED'] as const;
export type VisaComplianceStatus = (typeof VisaComplianceStatuses)[number];

export const VisaNotificationTypes = ['EXPIRY_ALERT', 'STATUS_UPDATE', 'DOCUMENT_REQUEST', 'DECISION_RECORDED'] as const;
export type VisaNotificationType = (typeof VisaNotificationTypes)[number];

export class VisaStatusDto {
  @ApiProperty({ enum: VisaStatuses })
  status!: VisaStatus;
}
