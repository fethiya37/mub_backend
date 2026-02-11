import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  JobApplicationRepository,
  type ApplyOrReapplyInput,
  type ListAdminFilters,
  type ListEmployerFilters,
  type ListMyFilters,
  type JobApplicationListItem
} from '../repositories/job-application.repository';

@Injectable()
export class JobApplicationPrismaRepository extends JobApplicationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findById(id: string) {
    return this.prisma.jobApplication.findUnique({ where: { id } });
  }

  findByApplicantJob(applicantId: string, jobPostingId: string) {
    return this.prisma.jobApplication.findUnique({
      where: { jobPostingId_applicantId: { jobPostingId, applicantId } }
    });
  }

  async applyOrReapply(input: ApplyOrReapplyInput) {
    const existing = await this.findByApplicantJob(input.applicantId, input.jobPostingId);

    if (!existing) {
      return this.prisma.jobApplication.create({
        data: {
          jobPostingId: input.jobPostingId,
          applicantId: input.applicantId,
          cvFileUrl: input.cvFileUrl,
          status: 'PENDING'
        }
      });
    }

    return this.prisma.jobApplication.update({
      where: { id: existing.id },
      data: {
        cvFileUrl: input.cvFileUrl,
        status: 'PENDING'
      }
    });
  }

  updateCv(id: string, cvFileUrl: string) {
    return this.prisma.jobApplication.update({
      where: { id },
      data: { cvFileUrl }
    });
  }

  setStatus(id: string, status: string) {
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status: status as any }
    });
  }

  private fullNameOf(a: { firstName?: string | null; middleName?: string | null; lastName?: string | null } | null | undefined) {
    const parts = [a?.firstName, a?.middleName, a?.lastName].filter((x) => x && String(x).trim().length > 0) as string[];
    return parts.join(' ').trim();
  }

  private toListItem(row: any, jobTitle: string): JobApplicationListItem {
    return {
      id: row.id,
      jobPostingId: row.jobPostingId,
      jobTitle,
      applicantId: row.applicantId,
      applicantName: this.fullNameOf(row.applicant),
      cvFileUrl: row.cvFileUrl,
      status: row.status
    };
  }

  async listMy(applicantId: string, filters: ListMyFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { applicantId };
    if (filters.status) where.status = filters.status;
    if (filters.jobPostingId) where.jobPostingId = filters.jobPostingId;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
        include: {
          jobPosting: { select: { jobTitle: true } },
          applicant: { select: { firstName: true, middleName: true, lastName: true } }
        }
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    return {
      items: rows.map((r) => this.toListItem(r, r.jobPosting?.jobTitle ?? 'Unknown Job')),
      total,
      page,
      pageSize
    };
  }

  async listAdmin(filters: ListAdminFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.jobPostingId) where.jobPostingId = filters.jobPostingId;
    if (filters.applicantId) where.applicantId = filters.applicantId;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
        include: {
          jobPosting: { select: { jobTitle: true } },
          applicant: { select: { firstName: true, middleName: true, lastName: true } }
        }
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    return {
      items: rows.map((r) => this.toListItem(r, r.jobPosting?.jobTitle ?? 'Unknown Job')),
      total,
      page,
      pageSize
    };
  }

  async listEmployer(filters: ListEmployerFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {
      jobPosting: { employerId: filters.employerId }
    };

    if (filters.status) where.status = filters.status;
    if (filters.jobPostingId) where.jobPostingId = filters.jobPostingId;

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          jobPostingId: true,
          applicantId: true,
          cvFileUrl: true,
          status: true,
          applicant: { select: { firstName: true, middleName: true, lastName: true } }
        }
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    const jobIds = Array.from(new Set(rows.map((r) => r.jobPostingId)));
    const jobs = await this.prisma.jobPosting.findMany({
      where: { id: { in: jobIds } },
      select: { id: true, jobTitle: true }
    });

    const jobTitleById = new Map(jobs.map((j) => [j.id, j.jobTitle]));

    return {
      items: rows.map((r) => this.toListItem(r, jobTitleById.get(r.jobPostingId) ?? 'Unknown Job')),
      total,
      page,
      pageSize
    };
  }
}
