export type CvAuditCreate = {
  cvId: string;
  action: string;
  performedBy?: string | null;
  meta?: any | null;
};

export abstract class CvAuditLogRepository {
  abstract create(input: CvAuditCreate): Promise<void>;
}
