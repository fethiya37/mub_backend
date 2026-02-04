import { ApiProperty } from '@nestjs/swagger';

export const VisaCaseStatuses = [
  'INITIATED',
  'MEDICAL',
  'INSURANCE',
  'FINGERPRINT',
  'EMBASSY',
  'LMIS',
  'VISA',
  'FLIGHT_BOOKED',
  'RETURNED',
  'DEPLOYED',
  'CLOSED'
] as const;
export type VisaCaseStatus = (typeof VisaCaseStatuses)[number];

export const MedicalFitnessResults = ['FIT', 'UNFIT'] as const;
export type MedicalFitnessResult = (typeof MedicalFitnessResults)[number];

export const EmbassyProcessStatuses = ['PENDING', 'COMPLETED'] as const;
export type EmbassyProcessStatus = (typeof EmbassyProcessStatuses)[number];

export const LMISStatuses = ['PENDING', 'ISSUED', 'REJECTED'] as const;
export type LMISStatus = (typeof LMISStatuses)[number];

export const VisaAttemptStatuses = ['ISSUED', 'REJECTED'] as const;
export type VisaAttemptStatus = (typeof VisaAttemptStatuses)[number];

export class VisaEnumsDoc {
  @ApiProperty({ example: VisaCaseStatuses })
  visaCaseStatuses!: typeof VisaCaseStatuses;

  @ApiProperty({ example: MedicalFitnessResults })
  medicalFitnessResults!: typeof MedicalFitnessResults;

  @ApiProperty({ example: EmbassyProcessStatuses })
  embassyProcessStatuses!: typeof EmbassyProcessStatuses;

  @ApiProperty({ example: LMISStatuses })
  lmisStatuses!: typeof LMISStatuses;

  @ApiProperty({ example: VisaAttemptStatuses })
  visaAttemptStatuses!: typeof VisaAttemptStatuses;
}
