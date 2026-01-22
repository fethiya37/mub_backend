import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { JobPostingRepository, PublicJobListFilters } from '../repositories/job-posting.repository';

@Injectable()
export class JobPostingPrismaRepository extends JobPostingRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(employerId: string, input: any) {
    return this.prisma.jobPosting.create({
      data: {
        employerId,
        jobTitle: input.jobTitle,
        jobDescription: input.jobDescription,
        country: input.country,
        city: input.city ?? null,
        salaryRange: input.salaryRange ?? null,
        contractType: input.contractType,
        status: input.status ?? 'DRAFT'
      }
    });
  }

  update(jobId: string, input: any) {
    return this.prisma.jobPosting.update({
      where: { id: jobId },
      data: input
    });
  }

  findById(jobId: string) {
    return this.prisma.jobPosting.findUnique({ where: { id: jobId } });
  }

  async listByEmployer(employerId: string, status: string | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = { employerId };
    if (status) where.status = status;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobPosting.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.jobPosting.count({ where })
    ]);

    return { items, total };
  }

  async listPublic(filters: PublicJobListFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    const status = (filters.status ?? 'ACTIVE').toUpperCase();
    where.status = status;

    if (filters.country) where.country = { contains: filters.country, mode: 'insensitive' };
    if (filters.city) where.city = { contains: filters.city, mode: 'insensitive' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.jobPosting.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.jobPosting.count({ where })
    ]);

    return { items, total };
  }
}
