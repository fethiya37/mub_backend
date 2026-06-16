import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  EmployerCreateInput,
  EmployerRepository,
  EmployerUpdateInput,
} from '../repositories/employer.repository';

@Injectable()
export class EmployerPrismaRepository extends EmployerRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: EmployerCreateInput) {
    return this.prisma.employer.create({
      data: {
        organizationName: input.organizationName,
        country: input.country,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        registrationNumber: input.registrationNumber,
        address: input.address ?? null,

        logoUrl: input.logoUrl ?? null,

        ownerName: input.ownerName,
        ownerIdNumber: input.ownerIdNumber ?? null,
        ownerIdFileUrl: input.ownerIdFileUrl ?? null,

        licenseNumber: input.licenseNumber,
        licenseFileUrl: input.licenseFileUrl,
        licenseExpiry: input.licenseExpiry ?? null,

        createdBy: input.createdBy,
      },
    });
  }

  findById(id: string) {
    return this.prisma.employer.findUnique({
      where: { id },
      include: { approvalLogs: { orderBy: { actionDate: 'desc' } } },
    });
  }

  findByContactEmail(email: string) {
    return this.prisma.employer.findUnique({ where: { contactEmail: email } });
  }

  findByContactPhone(phone: string) {
    return this.prisma.employer.findUnique({ where: { contactPhone: phone } });
  }

  findByUserId(userId: string) {
    return this.prisma.employer.findUnique({ where: { userId } });
  }

  findByLicenseNumber(licenseNumber: string) {
    return this.prisma.employer.findUnique({ where: { licenseNumber } });
  }

  findByOwnerIdNumber(ownerIdNumber: string) {
    return this.prisma.employer.findFirst({ where: { ownerIdNumber } });
  }

  async list(
    filters: { status?: string; country?: string },
    page: number,
    pageSize: number,
  ) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.country)
      where.country = { contains: filters.country, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.employer.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
      this.prisma.employer.count({ where }),
    ]);

    return { items, total };
  }

  update(id: string, input: EmployerUpdateInput) {
    return this.prisma.employer.update({
      where: { id },
      data: input,
    });
  }

  async findApprovedPartners(country?: string) {
    const where: any = { status: 'APPROVED' };
    if (country) {
      where.country = { equals: country, mode: 'insensitive' };
    }

    return this.prisma.employer.findMany({
      where,
      select: {
        id: true,
        organizationName: true,
        country: true,
        contactEmail: true,
        contactPhone: true,
        logoUrl: true,
      },
      orderBy: { organizationName: 'asc' },
    });
  }

  async findDistinctPartnerCountries() {
    const partners = await this.prisma.employer.findMany({
      where: { status: 'APPROVED' },
      select: { country: true },
      distinct: ['country'],
    });

    return partners.map((p) => p.country).filter(Boolean);
  }
}
