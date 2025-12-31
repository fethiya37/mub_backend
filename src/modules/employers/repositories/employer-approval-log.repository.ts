export type EmployerApprovalLogCreate = {
  employerId: string;
  action: 'APPROVED' | 'REJECTED';
  reason?: string | null;
  actionBy: string;
};

export abstract class EmployerApprovalLogRepository {
  abstract add(input: EmployerApprovalLogCreate): Promise<any>;
  abstract listByEmployer(employerId: string): Promise<any[]>;
}
