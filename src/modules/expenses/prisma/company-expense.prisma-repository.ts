import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CompanyExpenseRepository, CompanyExpenseListFilters } from '../repositories/company-expense.repository';

@Injectable()
export class CompanyExpensePrismaRepository extends CompanyExpenseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: any) {
    return this.prisma.companyExpense.create({
      data: {
        typeId: input.typeId ?? null,
        typeNameOther: input.typeNameOther ?? null,
        amount: input.amount, // Prisma accepts decimal string
        expenseDate: input.expenseDate,
        referenceNo: input.referenceNo ?? null,
        description: input.description ?? null,
        createdBy: input.createdBy ?? null
      },
      include: { type: true }
    });
  }

  update(id: string, input: any) {
    return this.prisma.companyExpense.update({
      where: { id },
      data: {
        typeId: input.typeId === undefined ? undefined : input.typeId,
        typeNameOther: input.typeNameOther === undefined ? undefined : input.typeNameOther,
        amount: input.amount === undefined ? undefined : input.amount,
        expenseDate: input.expenseDate === undefined ? undefined : input.expenseDate,
        referenceNo: input.referenceNo === undefined ? undefined : input.referenceNo,
        description: input.description === undefined ? undefined : input.description
      },
      include: { type: true }
    });
  }

  async delete(id: string) {
    await this.prisma.companyExpense.delete({ where: { id } });
  }

  findById(id: string) {
    return this.prisma.companyExpense.findUnique({ where: { id }, include: { type: true } });
  }

  async list(filters: CompanyExpenseListFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (filters.typeId) where.typeId = filters.typeId;
    if (filters.from || filters.to) {
      where.expenseDate = {};
      if (filters.from) where.expenseDate.gte = filters.from;
      if (filters.to) where.expenseDate.lte = filters.to;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.companyExpense.findMany({
        where,
        include: { type: true },
        orderBy: { expenseDate: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.companyExpense.count({ where })
    ]);

    return { items, total };
  }
}
