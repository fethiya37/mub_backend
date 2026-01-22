import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LocalAgencyApprovalLogCreate, LocalAgencyApprovalLogRepository } from '../repositories/local-agency-approval-log.repository';

@Injectable()
export class LocalAgencyApprovalLogPrismaRepository extends LocalAgencyApprovalLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(input: LocalAgencyApprovalLogCreate) {
    return this.prisma.localAgencyApprovalLog.create({
      data: {
        agencyId: input.agencyId,
        action: input.action as any,
        reason: input.reason ?? null,
        actionBy: input.actionBy
      }
    });
  }

  listByAgency(agencyId: string) {
    return this.prisma.localAgencyApprovalLog.findMany({
      where: { agencyId },
      orderBy: { actionDate: 'desc' }
    });
  }
}
