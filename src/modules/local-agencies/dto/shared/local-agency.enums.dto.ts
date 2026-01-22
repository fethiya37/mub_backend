import { ApiProperty } from '@nestjs/swagger';

export const LocalAgencyStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] as const;
export type LocalAgencyStatus = (typeof LocalAgencyStatuses)[number];

export const LocalAgencyApprovalActions = ['APPROVED', 'REJECTED', 'SUSPENDED', 'REACTIVATED'] as const;
export type LocalAgencyApprovalAction = (typeof LocalAgencyApprovalActions)[number];

export class LocalAgencyStatusDto {
  @ApiProperty({ enum: LocalAgencyStatuses, example: 'APPROVED' })
  status!: LocalAgencyStatus;
}
