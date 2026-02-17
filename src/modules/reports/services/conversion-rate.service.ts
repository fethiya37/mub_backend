import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { ConversionRateQueryDto } from '../dto/conversion-rate.query.dto';

type StageKey = 'APPLIED' | 'MEDICAL_PASSED' | 'VISA_ISSUED' | 'DEPLOYED';

@Injectable()
export class ConversionRateService {
  constructor(private readonly prisma: PrismaService) {}

  private toDateOrUndefined(v?: string) {
    if (!v) return undefined;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return undefined;
    return d;
  }

  private rate(count: number, total: number) {
    if (!total) return 0;
    return Math.round((count / total) * 10000) / 100;
  }

  private stageLabel(stage: StageKey) {
    if (stage === 'APPLIED') return 'Applied';
    if (stage === 'MEDICAL_PASSED') return 'Medical Passed';
    if (stage === 'VISA_ISSUED') return 'Visa Issued';
    return 'Deployed';
  }

  async getConversionRate(q: ConversionRateQueryDto) {
    const from = this.toDateOrUndefined(q.from);
    const to = this.toDateOrUndefined(q.to);

    const appliedWhere: any = {};
    if (from || to) {
      appliedWhere.createdAt = {};
      if (from) appliedWhere.createdAt.gte = from;
      if (to) appliedWhere.createdAt.lte = to;
    }

    const appliedRows = await this.prisma.jobApplication.findMany({
      where: appliedWhere,
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const applicantIds = appliedRows.map((x) => x.applicantId);
    const totalApplicants = applicantIds.length;

    if (!totalApplicants) {
      const stages = (['APPLIED', 'MEDICAL_PASSED', 'VISA_ISSUED', 'DEPLOYED'] as StageKey[]).map((s) => ({
        key: s,
        label: this.stageLabel(s),
        count: 0,
        conversionRate: 0
      }));

      return {
        filters: { from: from ? from.toISOString() : null, to: to ? to.toISOString() : null },
        totalApplicants: 0,
        stages
      };
    }

    const medicalPassedCases = await this.prisma.visaCase.findMany({
      where: {
        applicantId: { in: applicantIds },
        medical: { is: { result: 'FIT' } }
      },
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const visaIssuedCases = await this.prisma.visaCase.findMany({
      where: {
        applicantId: { in: applicantIds },
        visaAttempts: { some: { status: 'ISSUED' } }
      },
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const deployedCases = await this.prisma.visaCase.findMany({
      where: {
        applicantId: { in: applicantIds },
        OR: [{ status: 'DEPLOYED' }, { completedStatuses: { has: 'DEPLOYED' } }]
      },
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const appliedCount = totalApplicants;
    const medicalPassedCount = medicalPassedCases.length;
    const visaIssuedCount = visaIssuedCases.length;
    const deployedCount = deployedCases.length;

    const stages = [
      {
        key: 'APPLIED' as const,
        label: this.stageLabel('APPLIED'),
        count: appliedCount,
        conversionRate: this.rate(appliedCount, totalApplicants)
      },
      {
        key: 'MEDICAL_PASSED' as const,
        label: this.stageLabel('MEDICAL_PASSED'),
        count: medicalPassedCount,
        conversionRate: this.rate(medicalPassedCount, totalApplicants)
      },
      {
        key: 'VISA_ISSUED' as const,
        label: this.stageLabel('VISA_ISSUED'),
        count: visaIssuedCount,
        conversionRate: this.rate(visaIssuedCount, totalApplicants)
      },
      {
        key: 'DEPLOYED' as const,
        label: this.stageLabel('DEPLOYED'),
        count: deployedCount,
        conversionRate: this.rate(deployedCount, totalApplicants)
      }
    ];

    return {
      filters: { from: from ? from.toISOString() : null, to: to ? to.toISOString() : null },
      totalApplicants,
      stages
    };
  }
}
