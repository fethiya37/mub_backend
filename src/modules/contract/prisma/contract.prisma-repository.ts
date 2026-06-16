import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  ContractRepository,
  type CreateContractInput,
  type UpdateContractInput,
  type ListContractsFilters,
} from '../repositories/contract.repository';

@Injectable()
export class ContractPrismaRepository extends ContractRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string) {
    return this.prisma.contract.findUnique({
      where: { id },
      include: {
        visaCase: {
          include: {
            applicant: true,
            partner: true,
          },
        },
        sponsor: true,
      },
    });
  }

  async findByVisaCaseId(visaCaseId: string) {
    return this.prisma.contract.findUnique({
      where: { visaCaseId },
      include: {
        visaCase: {
          include: {
            applicant: true,
            partner: true,
          },
        },
        sponsor: true,
      },
    });
  }

  async create(input: CreateContractInput) {
    return this.prisma.contract.create({
      data: {
        visaCaseId: input.visaCaseId,
        contractNumber: input.contractNumber,
        contractFileUrl: input.contractFileUrl,
        contractPeriodYears: input.contractPeriodYears,
        monthlySalary: input.monthlySalary,
        currency: input.currency,
        sponsorId: input.sponsorId,
        status: 'ISSUED',
        issuedAt: new Date(),
      },
      include: {
        visaCase: {
          include: {
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            partner: {
              select: {
                organizationName: true,
                country: true,
              },
            },
          },
        },
        sponsor: true,
      },
    });
  }

  async update(id: string, input: UpdateContractInput) {
    return this.prisma.contract.update({
      where: { id },
      data: {
        signedFileUrl: input.signedFileUrl,
        status: input.status as any,
        contractPeriodYears: input.contractPeriodYears,
        monthlySalary: input.monthlySalary,
        currency: input.currency,
        signedAt: input.signedAt,
        sponsorId: input.sponsorId,
      },
      include: {
        visaCase: {
          include: {
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            partner: {
              select: {
                organizationName: true,
                country: true,
              },
            },
          },
        },
        sponsor: true,
      },
    });
  }

  async list(filters: ListContractsFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (filters.visaCaseId) where.visaCaseId = filters.visaCaseId;
    if (filters.status) where.status = filters.status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contract.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          visaCase: {
            include: {
              applicant: {
                select: { firstName: true, lastName: true, phone: true },
              },
              partner: {
                select: { organizationName: true },
              },
            },
          },
          sponsor: true,
        },
      }),
      this.prisma.contract.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async countByYearMonth(year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return this.prisma.contract.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
  }
}
