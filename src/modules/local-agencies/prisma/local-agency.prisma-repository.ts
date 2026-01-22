import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LocalAgencyCreateInput, LocalAgencyRepository, LocalAgencyUpdateInput } from '../repositories/local-agency.repository';

@Injectable()
export class LocalAgencyPrismaRepository extends LocalAgencyRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: LocalAgencyCreateInput) {
    return this.prisma.localAgency.create({
      data: {
        name: input.name,
        licenseNumber: input.licenseNumber,
        contactPerson: input.contactPerson ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        status: 'PENDING'
      }
    });
  }

  findById(id: string) {
    return this.prisma.localAgency.findUnique({ where: { id } });
  }

  findByLicenseNumber(licenseNumber: string) {
    return this.prisma.localAgency.findUnique({ where: { licenseNumber } });
  }

  findByUserId(userId: string) {
    return this.prisma.localAgency.findUnique({ where: { userId } });
  }

  async listByStatus(status: string | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) where.status = status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.localAgency.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.localAgency.count({ where })
    ]);

    return { items, total };
  }

  update(id: string, input: LocalAgencyUpdateInput) {
    return this.prisma.localAgency.update({ where: { id }, data: input as any });
  }
}
