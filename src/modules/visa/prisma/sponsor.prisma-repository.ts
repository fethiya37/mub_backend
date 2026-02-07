import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { SponsorRepository, type CreateSponsorInput, type SponsorListFilters, type UpdateSponsorInput } from '../repositories/sponsor.repository';

@Injectable()
export class SponsorPrismaRepository extends SponsorRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findById(id: string) {
    return this.prisma.sponsor.findUnique({ where: { id } });
  }

  create(input: CreateSponsorInput) {
    return this.prisma.sponsor.create({
      data: {
        fullName: input.fullName,
        sponsorIdFileUrl: input.sponsorIdFileUrl ?? null,
        phone: input.phone ?? null
      }
    });
  }

  update(id: string, input: UpdateSponsorInput) {
    return this.prisma.sponsor.update({
      where: { id },
      data: {
        ...input,
        sponsorIdFileUrl: 'sponsorIdFileUrl' in input ? input.sponsorIdFileUrl ?? null : undefined,
        phone: 'phone' in input ? input.phone ?? null : undefined
      }
    });
  }

  async list(filters: SponsorListFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = {};
    if (filters.q) {
      where.OR = [
        { fullName: { contains: filters.q, mode: 'insensitive' } },
        { phone: { contains: filters.q, mode: 'insensitive' } }
      ];
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sponsor.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.sponsor.count({ where })
    ]);

    return { items, total };
  }
}
