import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaApplicationCreate, VisaApplicationRepository, VisaApplicationUpdate } from '../repositories/visa-application.repository';

@Injectable()
export class VisaApplicationPrismaRepository extends VisaApplicationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  createDraft(input: VisaApplicationCreate) {
    return this.prisma.visaApplication.create({
      data: {
        applicantId: input.applicantId,
        employerId: input.employerId ?? null,
        jobId: input.jobId ?? null,
        visaType: input.visaType,
        destinationCountry: input.destinationCountry,
        applicationReference: input.applicationReference ?? null,
        assignedCaseOfficerId: input.assignedCaseOfficerId ?? null,
        remarks: input.remarks ?? null,
        status: 'DRAFT'
      },
      include: { documents: true, compliance: true }
    });
  }

  findById(id: string) {
    return this.prisma.visaApplication.findUnique({
      where: { id },
      include: {
        documents: { orderBy: [{ documentType: 'asc' }, { versionNumber: 'desc' }] },
        compliance: { orderBy: { createdAt: 'asc' } },
        statusHistory: { orderBy: { changedAt: 'desc' } }
      }
    });
  }

  updateDraft(id: string, patch: VisaApplicationUpdate) {
    return this.prisma.visaApplication.update({
      where: { id },
      data: patch as any,
      include: { documents: true, compliance: true }
    });
  }

  async list(filters: any, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.applicantId) where.applicantId = filters.applicantId;
    if (filters.employerId) where.employerId = filters.employerId;
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.destinationCountry) where.destinationCountry = { contains: filters.destinationCountry, mode: 'insensitive' };
    if (filters.visaType) where.visaType = { contains: filters.visaType, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaApplication.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.visaApplication.count({ where })
    ]);

    return { items, total };
  }

  async findActiveDuplicate(input: { applicantId: string; destinationCountry: string; visaType: string }) {
    const activeStatuses = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING', 'APPROVED'];
    return this.prisma.visaApplication.findFirst({
      where: {
        applicantId: input.applicantId,
        destinationCountry: input.destinationCountry,
        visaType: input.visaType,
        status: { in: activeStatuses as any }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  setStatus(id: string, nextStatus: string, patch: any) {
    return this.prisma.visaApplication.update({
      where: { id },
      data: {
        status: nextStatus as any,
        ...patch
      }
    });
  }

  async listByApplicant(applicantId: string, status: string | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = { applicantId };
    if (status) where.status = status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaApplication.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.visaApplication.count({ where })
    ]);

    return { items, total };
  }
}
