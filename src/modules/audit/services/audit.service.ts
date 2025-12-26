import { Injectable } from '@nestjs/common';
import { AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditService {
  constructor(private readonly repo: AuditLogRepository) {}

  async log(input: {
    performedBy?: string | null;
    action: string;
    entityType?: string | null;
    entityId?: string | null;
    ipAddress?: string | null;
    userAgent?: string | null;
    meta?: Record<string, any> | null;
  }) {
    await this.repo.create(input);
  }

  async list(page = 1, pageSize = 50) {
    return this.repo.list(page, pageSize);
  }
}
