import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { JobApplicationRepository, type ApplyOrReapplyInput, type ListAdminFilters, type ListEmployerFilters, type ListMyFilters } from '../repositories/job-application.repository';

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

  async listMy(applicantId: string, filters: ListMyFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { applicantId };
    if (filters.status) where.status = filters.status;
    if (filters.jobPostingId) where.jobPostingId = filters.jobPostingId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    return { items, total, page, pageSize };
  }

  async listAdmin(filters: ListAdminFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.jobPostingId) where.jobPostingId = filters.jobPostingId;
    if (filters.applicantId) where.applicantId = filters.applicantId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    return { items, total, page, pageSize };
  }

  async listEmployer(filters: ListEmployerFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {
      jobPosting: { employerId: filters.employerId }
    };

    if (filters.status) where.status = filters.status;
    if (filters.jobPostingId) where.jobPostingId = filters.jobPostingId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobApplication.findMany({
        where,
        orderBy: { id: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.jobApplication.count({ where })
    ]);

    return { items, total, page, pageSize };
  }
}
