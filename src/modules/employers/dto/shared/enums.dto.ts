import { ApiProperty } from '@nestjs/swagger';

export const EmployerStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;
export type EmployerStatus = (typeof EmployerStatuses)[number];

export const JobStatuses = ['DRAFT', 'ACTIVE', 'CLOSED'] as const;
export type JobStatus = (typeof JobStatuses)[number];

export const ContractTypes = ['FULL_TIME', 'PART_TIME', 'TEMPORARY', 'CONTRACT', 'OTHER'] as const;
export type ContractType = (typeof ContractTypes)[number];

export class EmployerEnumsDoc {
  @ApiProperty({ example: EmployerStatuses })
  employerStatuses!: typeof EmployerStatuses;

  @ApiProperty({ example: JobStatuses })
  jobStatuses!: typeof JobStatuses;

  @ApiProperty({ example: ContractTypes })
  contractTypes!: typeof ContractTypes;
}
