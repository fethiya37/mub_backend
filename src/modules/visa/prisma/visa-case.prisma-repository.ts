import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  VisaCaseRepository,
  type AdminListVisaCasesFilters,
  type ApplicantListVisaCasesFilters,
  type CreateVisaCaseInput,
  type EmployerListVisaCasesFilters
} from '../repositories/visa-case.repository';

@Injectable()
export class VisaCasePrismaRepository extends VisaCaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findById(id: string) {
    return this.prisma.visaCase.findUnique({
      where: { id },
      select: {
        id: true,
        applicantId: true,
        partnerId: true,
        jobId: true,
        destinationCountry: true,
        status: true,
        isActive: true,
        caseManagerUserId: true,
        sponsorId: true,
        completedStatuses: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  create(input: CreateVisaCaseInput) {
    return this.prisma.visaCase.create({
      data: {
        applicantId: input.applicantId,
        partnerId: input.partnerId ?? null,
        jobId: input.jobId ?? null,
        destinationCountry: input.destinationCountry,
        caseManagerUserId: input.caseManagerUserId,
        sponsorId: input.sponsorId ?? null,
        status: 'INITIATED',
        isActive: true,
        completedStatuses: []
      }
    });
  }

  update(id: string, data: any) {
    return this.prisma.visaCase.update({ where: { id }, data });
  }

  async listAdmin(filters: AdminListVisaCasesFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.applicantId) where.applicantId = filters.applicantId;
    if (filters.partnerId) where.partnerId = filters.partnerId;
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.status) where.status = filters.status;
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaCase.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          applicantId: true,
          partnerId: true,
          jobId: true,
          destinationCountry: true,
          status: true,
          isActive: true,
          caseManagerUserId: true,
          sponsorId: true,
          completedStatuses: true,
          createdAt: true,
          updatedAt: true,
          applicant: { select: { firstName: true, middleName: true, lastName: true, phone: true } },
          partner: { select: { organizationName: true } },
          job: { select: { jobTitle: true } },
          caseManager: { select: { fullName: true, phone: true, email: true } },
          sponsor: { select: { fullName: true } }
        }
      }),
      this.prisma.visaCase.count({ where })
    ]);

    return { items, total, page, pageSize };
  }

  async listApplicant(filters: ApplicantListVisaCasesFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { applicantId: filters.applicantId };
    if (filters.status) where.status = filters.status;
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaCase.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          applicantId: true,
          partnerId: true,
          jobId: true,
          destinationCountry: true,
          status: true,
          isActive: true,
          caseManagerUserId: true,
          sponsorId: true,
          completedStatuses: true,
          createdAt: true,
          updatedAt: true,
          applicant: { select: { firstName: true, middleName: true, lastName: true, phone: true } },
          partner: { select: { organizationName: true } },
          job: { select: { jobTitle: true } },
          caseManager: { select: { fullName: true, phone: true, email: true } },
          sponsor: { select: { fullName: true } }
        }
      }),
      this.prisma.visaCase.count({ where })
    ]);

    return { items, total, page, pageSize };
  }

  async listEmployer(filters: EmployerListVisaCasesFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { job: { employerId: filters.employerId } };
    if (filters.jobId) where.jobId = filters.jobId;
    if (filters.status) where.status = filters.status;
    if (typeof filters.isActive === 'boolean') where.isActive = filters.isActive;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaCase.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          applicantId: true,
          partnerId: true,
          jobId: true,
          destinationCountry: true,
          status: true,
          isActive: true,
          caseManagerUserId: true,
          sponsorId: true,
          completedStatuses: true,
          createdAt: true,
          updatedAt: true,
          applicant: { select: { firstName: true, middleName: true, lastName: true, phone: true } },
          partner: { select: { organizationName: true } },
          job: { select: { jobTitle: true } },
          caseManager: { select: { fullName: true, phone: true, email: true } },
          sponsor: { select: { fullName: true } }
        }
      }),
      this.prisma.visaCase.count({ where })
    ]);

    return { items, total, page, pageSize };
  }
}
