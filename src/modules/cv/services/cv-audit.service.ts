import { Injectable } from '@nestjs/common';
import { AuditService } from '../../audit/services/audit.service';
import { CvAuditLogRepository } from '../repositories/cv-audit-log.repository';

@Injectable()
export class CvAuditService {
  constructor(
    private readonly audit: AuditService,
    private readonly cvAudit: CvAuditLogRepository
  ) {}

  async log(cvId: string, action: string, performedBy?: string | null, meta?: any | null) {
    await this.cvAudit.create({ cvId, action, performedBy: performedBy ?? null, meta: meta ?? null });
    await this.audit.log({
      performedBy: performedBy ?? null,
      action,
      entityType: 'ApplicantCv',
      entityId: cvId,
      meta: meta ?? undefined
    });
  }
}
