import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import type { PerformanceReportQueryDto } from '../dto/performance.query.dto';

type AgencyRow = {
  createdBy: string | null;
  createdByName: string | null;
  totalApplicants: number;
  deployedApplicants: number;
  rejectedApplicants: number;
  rejectionRate: number;
  avgDeployDurationHoursApprox: number | null;
  avgReturnDurationHours: number | null;
};

type StaffRow = {
  staffUserId: string;
  staffName: string | null;
  totalCases: number;
  deployedCases: number;
  returnedCases: number;
  deploymentRate: number;
  avgCaseDurationHoursApprox: number | null;
};

@Injectable()
export class PerformanceReportService {
  constructor(private readonly prisma: PrismaService) {}

  private parseFromTo(q: PerformanceReportQueryDto) {
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

  async getPerformance(q: PerformanceReportQueryDto) {
    const type = q.type ?? 'BOTH';
    const { from, to } = this.parseFromTo(q);

    const result: { agency?: AgencyRow[]; staff?: StaffRow[] } = {};

    if (type === 'AGENCY' || type === 'BOTH') {
      result.agency = await this.buildAgencyPerformance(from, to);
    }

    if (type === 'STAFF' || type === 'BOTH') {
      result.staff = await this.buildStaffPerformance(from, to);
    }

    return result;
  }

  private async buildAgencyPerformance(from: Date | null, to: Date | null): Promise<AgencyRow[]> {
    const createdAt = this.whereCreatedAt(from, to);

    const applicants = await this.prisma.applicantProfile.findMany({
      where: {
        registrationSource: 'AGENCY',
        ...(createdAt ? { createdAt } : {})
      },
      select: { applicantId: true, createdBy: true }
    });

    if (!applicants.length) return [];

    const applicantIds = applicants.map((a) => a.applicantId);
    const creatorByApplicantId = new Map(applicants.map((a) => [a.applicantId, a.createdBy ?? null]));

    const totalsByCreator = new Map<string | null, number>();
    for (const a of applicants) {
      const k = a.createdBy ?? null;
      totalsByCreator.set(k, (totalsByCreator.get(k) ?? 0) + 1);
    }

    const deployedApplicants = await this.prisma.visaCase.findMany({
      where: {
        applicantId: { in: applicantIds },
        OR: [{ status: 'DEPLOYED' }, { completedStatuses: { has: 'DEPLOYED' } }]
      },
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const deployedByCreator = new Map<string | null, number>();
    for (const r of deployedApplicants) {
      const k = creatorByApplicantId.get(r.applicantId) ?? null;
      deployedByCreator.set(k, (deployedByCreator.get(k) ?? 0) + 1);
    }

    const jobRejected = await this.prisma.jobApplication.findMany({
      where: { applicantId: { in: applicantIds }, status: 'REJECTED' },
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const visaAttemptRejected = await this.prisma.visaAttempt.findMany({
      where: { status: 'REJECTED', visaCase: { applicantId: { in: applicantIds } } },
      select: { visaCase: { select: { applicantId: true } } }
    });

    const returnedCases = await this.prisma.visaCase.findMany({
      where: { applicantId: { in: applicantIds }, status: 'RETURNED' },
      select: { applicantId: true },
      distinct: ['applicantId']
    });

    const returnedByReturnTable = await this.prisma.visaReturn.findMany({
      where: { visaCase: { applicantId: { in: applicantIds } } },
      select: { visaCase: { select: { applicantId: true } } }
    });

    const rejectedApplicantSet = new Set<string>();
    for (const r of jobRejected) rejectedApplicantSet.add(r.applicantId);
    for (const r of visaAttemptRejected) rejectedApplicantSet.add(r.visaCase.applicantId);
    for (const r of returnedCases) rejectedApplicantSet.add(r.applicantId);
    for (const r of returnedByReturnTable) rejectedApplicantSet.add(r.visaCase.applicantId);

    const rejectedByCreator = new Map<string | null, number>();
    for (const applicantId of rejectedApplicantSet) {
      const k = creatorByApplicantId.get(applicantId) ?? null;
      rejectedByCreator.set(k, (rejectedByCreator.get(k) ?? 0) + 1);
    }

    const deployedCaseDurations = await this.prisma.visaCase.findMany({
      where: {
        applicantId: { in: applicantIds },
        OR: [{ status: 'DEPLOYED' }, { completedStatuses: { has: 'DEPLOYED' } }]
      },
      select: { applicantId: true, createdAt: true, updatedAt: true }
    });

    const deploySumByCreator = new Map<string | null, { sum: number; n: number }>();
    for (const c of deployedCaseDurations) {
      const k = creatorByApplicantId.get(c.applicantId) ?? null;
      const h = this.hoursBetween(c.createdAt, c.updatedAt);
      const cur = deploySumByCreator.get(k) ?? { sum: 0, n: 0 };
      deploySumByCreator.set(k, { sum: cur.sum + h, n: cur.n + 1 });
    }

    const returnDurations = await this.prisma.visaReturn.findMany({
      where: { visaCase: { applicantId: { in: applicantIds } } },
      select: {
        returnedAt: true,
        visaCase: { select: { applicantId: true, createdAt: true } }
      }
    });

    const returnSumByCreator = new Map<string | null, { sum: number; n: number }>();
    for (const r of returnDurations) {
      const k = creatorByApplicantId.get(r.visaCase.applicantId) ?? null;
      const h = this.hoursBetween(r.visaCase.createdAt, r.returnedAt);
      const cur = returnSumByCreator.get(k) ?? { sum: 0, n: 0 };
      returnSumByCreator.set(k, { sum: cur.sum + h, n: cur.n + 1 });
    }

    const creatorIds = Array.from(new Set(applicants.map((a) => a.createdBy).filter((x) => !!x))) as string[];

    const users = creatorIds.length
      ? await this.prisma.user.findMany({
          where: { id: { in: creatorIds } },
          select: { id: true, fullName: true, phone: true, email: true }
        })
      : [];

    const userNameById = new Map<string, string>();
    for (const u of users) {
      const name = (u.fullName && String(u.fullName).trim().length ? String(u.fullName).trim() : null) ?? u.phone ?? u.email ?? u.id;
      userNameById.set(u.id, name);
    }

    const rows: AgencyRow[] = [];
    for (const [createdBy, totalApplicants] of totalsByCreator.entries()) {
      const deployedApplicantsCount = deployedByCreator.get(createdBy) ?? 0;
      const rejectedApplicantsCount = rejectedByCreator.get(createdBy) ?? 0;

      const rejectionRate = totalApplicants > 0 ? this.round2((rejectedApplicantsCount / totalApplicants) * 100) : 0;

      const deployAgg = deploySumByCreator.get(createdBy);
      const avgDeploy = deployAgg && deployAgg.n > 0 ? this.round2(deployAgg.sum / deployAgg.n) : null;

      const returnAgg = returnSumByCreator.get(createdBy);
      const avgReturn = returnAgg && returnAgg.n > 0 ? this.round2(returnAgg.sum / returnAgg.n) : null;

      rows.push({
        createdBy: createdBy ?? null,
        createdByName: createdBy ? userNameById.get(createdBy) ?? null : null,
        totalApplicants,
        deployedApplicants: deployedApplicantsCount,
        rejectedApplicants: rejectedApplicantsCount,
        rejectionRate,
        avgDeployDurationHoursApprox: avgDeploy,
        avgReturnDurationHours: avgReturn
      });
    }

    rows.sort((a, b) => b.totalApplicants - a.totalApplicants);
    return rows;
  }

  private async buildStaffPerformance(from: Date | null, to: Date | null): Promise<StaffRow[]> {
    const createdAt = this.whereCreatedAt(from, to);

    const cases = await this.prisma.visaCase.findMany({
      where: {
        ...(createdAt ? { createdAt } : {})
      },
      select: { id: true, caseManagerUserId: true, createdAt: true, updatedAt: true, status: true, completedStatuses: true }
    });

    if (!cases.length) return [];

    const totalsByStaff = new Map<string, number>();
    for (const c of cases) {
      totalsByStaff.set(c.caseManagerUserId, (totalsByStaff.get(c.caseManagerUserId) ?? 0) + 1);
    }

    const deployedByStaff = new Map<string, number>();
    for (const c of cases) {
      const isDeployed = c.status === 'DEPLOYED' || (c.completedStatuses ?? []).includes('DEPLOYED' as any);
      if (!isDeployed) continue;
      deployedByStaff.set(c.caseManagerUserId, (deployedByStaff.get(c.caseManagerUserId) ?? 0) + 1);
    }

    const returnedByStaff = new Map<string, number>();
    for (const c of cases) {
      const isReturned = c.status === 'RETURNED';
      if (!isReturned) continue;
      returnedByStaff.set(c.caseManagerUserId, (returnedByStaff.get(c.caseManagerUserId) ?? 0) + 1);
    }

    const durationByStaff = new Map<string, { sum: number; n: number }>();
    for (const c of cases) {
      const h = this.hoursBetween(c.createdAt, c.updatedAt);
      const cur = durationByStaff.get(c.caseManagerUserId) ?? { sum: 0, n: 0 };
      durationByStaff.set(c.caseManagerUserId, { sum: cur.sum + h, n: cur.n + 1 });
    }

    const staffIds = Array.from(totalsByStaff.keys());
    const users = await this.prisma.user.findMany({
      where: { id: { in: staffIds } },
      select: { id: true, fullName: true, phone: true, email: true }
    });

    const staffNameById = new Map<string, string>();
    for (const u of users) {
      const name = (u.fullName && String(u.fullName).trim().length ? String(u.fullName).trim() : null) ?? u.phone ?? u.email ?? u.id;
      staffNameById.set(u.id, name);
    }

    const rows: StaffRow[] = [];
    for (const [staffUserId, totalCases] of totalsByStaff.entries()) {
      const deployedCases = deployedByStaff.get(staffUserId) ?? 0;
      const returnedCases = returnedByStaff.get(staffUserId) ?? 0;

      const deploymentRate = totalCases > 0 ? this.round2((deployedCases / totalCases) * 100) : 0;

      const agg = durationByStaff.get(staffUserId);
      const avg = agg && agg.n > 0 ? this.round2(agg.sum / agg.n) : null;

      rows.push({
        staffUserId,
        staffName: staffNameById.get(staffUserId) ?? null,
        totalCases,
        deployedCases,
        returnedCases,
        deploymentRate,
        avgCaseDurationHoursApprox: avg
      });
    }

    rows.sort((a, b) => b.totalCases - a.totalCases);
    return rows;
  }
}
