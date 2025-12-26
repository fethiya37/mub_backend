export type AuditLogCreate = {
  performedBy?: string | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  meta?: Record<string, any> | null;
};

export abstract class AuditLogRepository {
  abstract create(input: AuditLogCreate): Promise<void>;
  abstract list(page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
}
