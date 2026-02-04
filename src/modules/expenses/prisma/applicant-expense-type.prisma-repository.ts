import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantExpenseTypeRepository } from '../repositories/applicant-expense-type.repository';

@Injectable()
export class ApplicantExpenseTypePrismaRepository extends ApplicantExpenseTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: { name: string }) {
    return this.prisma.applicantExpenseType.create({ data: { name: input.name } });
  }

  update(id: string, input: { name?: string }) {
    return this.prisma.applicantExpenseType.update({ where: { id }, data: { name: input.name } });
  }

  async delete(id: string) {
    await this.prisma.applicantExpenseType.delete({ where: { id } });
  }

  findById(id: string) {
    return this.prisma.applicantExpenseType.findUnique({ where: { id } });
  }

  list() {
    return this.prisma.applicantExpenseType.findMany({ orderBy: { name: 'asc' } });
  }
}
