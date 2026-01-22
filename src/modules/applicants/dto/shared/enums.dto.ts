import { ApiProperty } from '@nestjs/swagger';

export const ApplicantProfileStatuses = ['DRAFT', 'SUBMITTED', 'REJECTED', 'VERIFIED'] as const;
export type ApplicantProfileStatus = (typeof ApplicantProfileStatuses)[number];

export const ApplicantDocumentTypes = ['PASSPORT', 'PERSONAL_PHOTO', 'COC_CERTIFICATE', 'LABOR_ID', 'OTHER'] as const;
export type ApplicantDocumentType = (typeof ApplicantDocumentTypes)[number];

export const Genders = ['MALE', 'FEMALE'] as const;
export type Gender = (typeof Genders)[number];

export const ApplicantRegistrationSources = ['SELF', 'AGENCY', 'MUB_STAFF'] as const;
export type ApplicantRegistrationSource = (typeof ApplicantRegistrationSources)[number];

export class EnumsDoc {
  @ApiProperty({ example: ApplicantProfileStatuses })
  profileStatuses!: typeof ApplicantProfileStatuses;

  @ApiProperty({ example: ApplicantDocumentTypes })
  documentTypes!: typeof ApplicantDocumentTypes;

  @ApiProperty({ example: Genders })
  genders!: typeof Genders;

  @ApiProperty({ example: ApplicantRegistrationSources })
  registrationSources!: typeof ApplicantRegistrationSources;
}
