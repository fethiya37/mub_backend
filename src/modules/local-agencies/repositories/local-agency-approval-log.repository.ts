export type LocalAgencyApprovalLogCreate = {
  agencyId: string;
  action: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'REACTIVATED';
  reason?: string | null;
  actionBy: string;
};

export abstract class LocalAgencyApprovalLogRepository {
  abstract add(input: LocalAgencyApprovalLogCreate): Promise<any>;
  abstract listByAgency(agencyId: string): Promise<any[]>;
}
