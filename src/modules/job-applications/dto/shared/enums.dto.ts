import { ApiProperty } from '@nestjs/swagger';

export const ApplicationStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SELECTED', 'WITHDRAWN'] as const;
export type ApplicationStatus = (typeof ApplicationStatuses)[number];

export const EmployerDecisions = ['SELECT', 'REJECT'] as const;
export type EmployerDecision = (typeof EmployerDecisions)[number];

export class JobApplicationEnumsDoc {
  @ApiProperty({ example: ApplicationStatuses })
  applicationStatuses!: typeof ApplicationStatuses;

  @ApiProperty({ example: EmployerDecisions })
  employerDecisions!: typeof EmployerDecisions;
}
