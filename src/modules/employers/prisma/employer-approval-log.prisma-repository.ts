import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmployerApprovalLogRepository } from '../repositories/employer-approval-log.repository';

@Injectable()
export class EmployerApprovalLogPrismaRepository extends EmployerApprovalLogRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(input: any) {
    return this.prisma.employerApprovalLog.create({
      data: {
        employerId: input.employerId,
        action: input.action,
        reason: input.reason ?? null,
        actionBy: input.actionBy
      }
    });
  }

  listByEmployer(employerId: string) {
    return this.prisma.employerApprovalLog.findMany({
      where: { employerId },
      orderBy: { actionDate: 'desc' }
    });
  }
}
