import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  SponsorRepository,
  type CreateSponsorInput,
  type UpdateSponsorInput,
  type ListSponsorsFilters,
} from '../repositories/sponsor.repository';

@Injectable()
export class SponsorPrismaRepository extends SponsorRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string) {
    return this.prisma.sponsor.findUnique({
      where: { id },
      include: {
        employer: {
          select: {
            id: true,
            organizationName: true,
            country: true,
          },
        },
      },
    });
  }

  async create(input: CreateSponsorInput) {
    return this.prisma.sponsor.create({
      data: {
        fullName: input.fullName,
        iqamaNumber: input.iqamaNumber,
        employerId: input.employerId,
        phone: input.phone,
        sponsorIdFileUrl: input.sponsorIdFileUrl,
      },
    });
  }

  async update(id: string, input: UpdateSponsorInput) {
    return this.prisma.sponsor.update({
      where: { id },
      data: {
        fullName: input.fullName,
        iqamaNumber: input.iqamaNumber,
        employerId: input.employerId,
        phone: input.phone,
        sponsorIdFileUrl: input.sponsorIdFileUrl,
      },
    });
  }

  async list(filters: ListSponsorsFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (filters.q) {
      where.OR = [
        { fullName: { contains: filters.q, mode: 'insensitive' } },
        { iqamaNumber: { contains: filters.q, mode: 'insensitive' } },
        { phone: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.employerId) {
      where.employerId = filters.employerId;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sponsor.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          employer: {
            select: {
              id: true,
              organizationName: true,
            },
          },
        },
      }),
      this.prisma.sponsor.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findByEmployerId(employerId: string) {
    return this.prisma.sponsor.findMany({
      where: { employerId },
      orderBy: { fullName: 'asc' },
    });
  }
}
