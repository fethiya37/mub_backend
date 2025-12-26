import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AuditLogCreate, AuditLogRepository } from '../repositories/audit-log.repository';

@Injectable()
export class AuditLogPrismaRepository extends AuditLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: AuditLogCreate): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        performedBy: input.performedBy ?? null,
        action: input.action,
        entityType: input.entityType ?? null,
        entityId: input.entityId ?? null,
        ipAddress: input.ipAddress ?? null,
        userAgent: input.userAgent ?? null,
        meta: input.meta ?? undefined
      }
    });
  }

  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.auditLog.count()
    ]);
    return { items, total };
  }
}
