import { ApiProperty } from '@nestjs/swagger';

export const CV_STATUS = {
  draft: 'draft',
  submitted: 'submitted',
  approved: 'approved',
  rejected: 'rejected'
} as const;

export type CvStatus = (typeof CV_STATUS)[keyof typeof CV_STATUS];

export const CV_SECTIONS = {
  header: 'header',
  summary: 'summary',
  skills: 'skills',
  experience: 'experience',
  education: 'education',
  certifications: 'certifications',
  personalInfo: 'personalInfo',
  preferences: 'preferences',
  declaration: 'declaration'
} as const;

export type CvSectionName = (typeof CV_SECTIONS)[keyof typeof CV_SECTIONS];

export class CvStatusDto {
  @ApiProperty({ enum: Object.values(CV_STATUS), example: CV_STATUS.draft })
  status!: CvStatus;
}
