import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantCvCreate, ApplicantCvRepository } from '../repositories/applicant-cv.repository';

@Injectable()
export class ApplicantCvPrismaRepository extends ApplicantCvRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: ApplicantCvCreate) {
    return this.prisma.applicantCv.create({
      data: {
        applicantId: input.applicantId,
        jobId: input.jobId ?? null,
        cvTemplateId: input.cvTemplateId
      }
    });
  }

  findById(id: string) {
    return this.prisma.applicantCv.findUnique({
      where: { id },
      include: {
        template: true,
        sections: { orderBy: { displayOrder: 'asc' } },
        versions: { orderBy: { versionNumber: 'desc' } }
      }
    });
  }

  findByApplicantAndJob(applicantId: string, jobId: string) {
    return this.prisma.applicantCv.findFirst({
      where: { applicantId, jobId },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async listForApplicant(filters: { applicantId: string; status?: string; jobId?: string }, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { applicantId: filters.applicantId };
    if (filters.status) where.status = filters.status;
    if (filters.jobId) where.jobId = filters.jobId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantCv.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        include: { template: true }
      }),
      this.prisma.applicantCv.count({ where })
    ]);

    return { items, total };
  }

  async listForAdmin(filters: { status?: string; applicantId?: string; jobId?: string }, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.applicantId) where.applicantId = filters.applicantId;
    if (filters.jobId) where.jobId = filters.jobId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantCv.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        include: { template: true }
      }),
      this.prisma.applicantCv.count({ where })
    ]);

    return { items, total };
  }

  async listForAgency(
    filters: { status?: string; applicantId?: string; jobId?: string; createdBy?: string },
    page: number,
    pageSize: number
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = {
      applicant: {
        registrationSource: 'AGENCY',
        createdBy: filters.createdBy ?? undefined
      }
    };

    if (filters.status) where.status = filters.status;
    if (filters.applicantId) where.applicantId = filters.applicantId;
    if (filters.jobId) where.jobId = filters.jobId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantCv.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        include: { template: true }
      }),
      this.prisma.applicantCv.count({ where })
    ]);

    return { items, total };
  }

  update(id: string, patch: any) {
    return this.prisma.applicantCv.update({ where: { id }, data: patch });
  }
}
