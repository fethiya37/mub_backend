import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaComplianceCreate, VisaComplianceRepository, VisaComplianceUpdate } from '../repositories/visa-compliance.repository';

@Injectable()
export class VisaCompliancePrismaRepository extends VisaComplianceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(input: VisaComplianceCreate) {
    return this.prisma.visaComplianceCheck.create({
      data: {
        visaApplicationId: input.visaApplicationId,
        requirementType: input.requirementType,
        requirementStatus: 'PENDING',
        remarks: input.remarks ?? null,
        checkedByAdminId: input.createdByAdminId ?? null,
        checkedAt: null
      }
    });
  }

  findById(id: string) {
    return this.prisma.visaComplianceCheck.findUnique({ where: { id } });
  }

  listByVisa(visaApplicationId: string) {
    return this.prisma.visaComplianceCheck.findMany({
      where: { visaApplicationId },
      orderBy: { createdAt: 'asc' }
    });
  }

  update(id: string, patch: VisaComplianceUpdate) {
    return this.prisma.visaComplianceCheck.update({
      where: { id },
      data: {
        requirementStatus: patch.requirementStatus as any,
        remarks: patch.remarks ?? null,
        checkedByAdminId: patch.checkedByAdminId ?? null,
        checkedAt: patch.checkedAt ?? null
      }
    });
  }

  async hasBlockingFailures(visaApplicationId: string) {
    const failed = await this.prisma.visaComplianceCheck.count({
      where: { visaApplicationId, requirementStatus: 'FAILED' }
    });
    if (failed > 0) return true;

    const pending = await this.prisma.visaComplianceCheck.count({
      where: { visaApplicationId, requirementStatus: 'PENDING' }
    });
    return pending > 0;
  }
}
