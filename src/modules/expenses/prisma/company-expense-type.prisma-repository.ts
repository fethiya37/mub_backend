import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CompanyExpenseTypeRepository } from '../repositories/company-expense-type.repository';

@Injectable()
export class CompanyExpenseTypePrismaRepository extends CompanyExpenseTypeRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: { name: string }) {
    return this.prisma.companyExpenseType.create({ data: { name: input.name } });
  }

  update(id: string, input: { name?: string }) {
    return this.prisma.companyExpenseType.update({ where: { id }, data: { name: input.name } });
  }

  async delete(id: string) {
    await this.prisma.companyExpenseType.delete({ where: { id } });
  }

  findById(id: string) {
    return this.prisma.companyExpenseType.findUnique({ where: { id } });
  }

  list() {
    return this.prisma.companyExpenseType.findMany({ orderBy: { name: 'asc' } });
  }
}
