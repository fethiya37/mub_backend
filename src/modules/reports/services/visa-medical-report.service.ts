import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { VisaMedicalReportQueryDto } from '../dto/visa-medical.query.dto';

type Ratio = { numerator: number; denominator: number; rate: number };

@Injectable()
export class VisaMedicalReportService {
  constructor(private readonly prisma: PrismaService) {}

  private parseFromTo(q: VisaMedicalReportQueryDto) {
    const from = q.from ? new Date(q.from) : null;
    const to = q.to ? new Date(q.to) : null;
    return { from, to };
  }

  private whereCreatedAt(from: Date | null, to: Date | null) {
    if (!from && !to) return undefined;
    if (from && to) return { gte: from, lte: to };
    if (from) return { gte: from };
    return { lte: to as Date };
  }

  private hoursBetween(a: Date, b: Date) {
    const ms = b.getTime() - a.getTime();
    return ms >= 0 ? ms / 36e5 : 0;
  }

  private round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  private ratio(numerator: number, denominator: number): Ratio {
    const rate = denominator > 0 ? this.round2((numerator / denominator) * 100) : 0;
    return { numerator, denominator, rate };
  }

  async getReport(q: VisaMedicalReportQueryDto) {
    const scope = q.scope ?? 'ACTIVE_ONLY';
    const { from, to } = this.parseFromTo(q);

    const caseCreatedAt = this.whereCreatedAt(from, to);
    const medicalCreatedAt = this.whereCreatedAt(from, to);
    const attemptCreatedAt = this.whereCreatedAt(from, to);

    const visaCaseWhere: any = {
      ...(scope === 'ACTIVE_ONLY' ? { isActive: true } : {}),
      ...(caseCreatedAt ? { createdAt: caseCreatedAt } : {})
    };

    const [totalCases, pendingCases] = await this.prisma.$transaction([
      this.prisma.visaCase.count({ where: visaCaseWhere }),
      this.prisma.visaCase.count({
        where: {
          ...visaCaseWhere,
          status: { in: ['INITIATED', 'MEDICAL', 'INSURANCE', 'FINGERPRINT', 'EMBASSY', 'LMIS', 'VISA', 'FLIGHT_BOOKED'] }
        }
      })
    ]);

    const medicalWhere: any = {
      ...(medicalCreatedAt ? { createdAt: medicalCreatedAt } : {}),
      visaCase: {
        ...(scope === 'ACTIVE_ONLY' ? { isActive: true } : {}),
        ...(caseCreatedAt ? { createdAt: caseCreatedAt } : {})
      }
    };

    const [medicalTotal, medicalFit, medicalUnfit] = await this.prisma.$transaction([
      this.prisma.visaMedical.count({ where: medicalWhere }),
      this.prisma.visaMedical.count({ where: { ...medicalWhere, result: 'FIT' } }),
      this.prisma.visaMedical.count({ where: { ...medicalWhere, result: 'UNFIT' } })
    ]);

    const attemptWhere: any = {
      ...(attemptCreatedAt ? { createdAt: attemptCreatedAt } : {}),
      visaCase: {
        ...(scope === 'ACTIVE_ONLY' ? { isActive: true } : {}),
        ...(caseCreatedAt ? { createdAt: caseCreatedAt } : {})
      }
    };

    const [attemptTotal, attemptIssued, attemptRejected] = await this.prisma.$transaction([
      this.prisma.visaAttempt.count({ where: attemptWhere }),
      this.prisma.visaAttempt.count({ where: { ...attemptWhere, status: 'ISSUED' } }),
      this.prisma.visaAttempt.count({ where: { ...attemptWhere, status: 'REJECTED' } })
    ]);

    const medicalRows = await this.prisma.visaMedical.findMany({
      where: medicalWhere,
      select: { createdAt: true, visaCase: { select: { createdAt: true } } }
    });

    let medicalSum = 0;
    let medicalN = 0;
    for (const r of medicalRows) {
      medicalSum += this.hoursBetween(r.visaCase.createdAt, r.createdAt);
      medicalN += 1;
    }
    const avgHoursToMedicalResult = medicalN > 0 ? this.round2(medicalSum / medicalN) : null;

    const attemptRows = await this.prisma.visaAttempt.findMany({
      where: attemptWhere,
      select: { createdAt: true, issuedAt: true, visaCase: { select: { createdAt: true } } }
    });

    let visaSumCreated = 0;
    let visaNCreated = 0;
    let visaSumIssuedAt = 0;
    let visaNIssuedAt = 0;

    for (const r of attemptRows) {
      visaSumCreated += this.hoursBetween(r.visaCase.createdAt, r.createdAt);
      visaNCreated += 1;

      if (r.issuedAt) {
        visaSumIssuedAt += this.hoursBetween(r.visaCase.createdAt, r.issuedAt);
        visaNIssuedAt += 1;
      }
    }

    const avgHoursToVisaOutcomeByAttemptCreatedAt = visaNCreated > 0 ? this.round2(visaSumCreated / visaNCreated) : null;
    const avgHoursToVisaIssueByIssuedAt = visaNIssuedAt > 0 ? this.round2(visaSumIssuedAt / visaNIssuedAt) : null;

    const medicalPassRate = this.ratio(medicalFit, medicalTotal);
    const medicalFailRate = this.ratio(medicalUnfit, medicalTotal);

    const visaDecisionDenom = attemptIssued + attemptRejected;
    const visaApprovalRate = this.ratio(attemptIssued, visaDecisionDenom);

    return {
      filters: {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
        scope
      },
      totals: {
        totalCases,
        pendingCases
      },
      medical: {
        totalMedicalRecords: medicalTotal,
        fit: medicalFit,
        unfit: medicalUnfit,
        passRate: medicalPassRate,
        failRate: medicalFailRate,
        avgHoursToMedicalResultFromCaseCreatedAt: avgHoursToMedicalResult
      },
      visa: {
        totalVisaAttempts: attemptTotal,
        issued: attemptIssued,
        rejected: attemptRejected,
        approvalRate: visaApprovalRate,
        avgHoursToVisaOutcomeFromCaseCreatedAt_byAttemptCreatedAt: avgHoursToVisaOutcomeByAttemptCreatedAt,
        avgHoursToVisaIssueFromCaseCreatedAt_byIssuedAt: avgHoursToVisaIssueByIssuedAt
      }
    };
  }
}
