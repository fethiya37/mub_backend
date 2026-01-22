import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CvAuditCreate, CvAuditLogRepository } from '../repositories/cv-audit-log.repository';

@Injectable()
export class CvAuditLogPrismaRepository extends CvAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: CvAuditCreate) {
    await this.prisma.cvAuditLog.create({
      data: {
        cvId: input.cvId,
        action: input.action,
        performedBy: input.performedBy ?? null,
        meta: input.meta ?? undefined
      }
    });
  }
}
