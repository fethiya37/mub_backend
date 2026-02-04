import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantExpenseRepository, ApplicantExpenseListFilters } from '../repositories/applicant-expense.repository';

@Injectable()
export class ApplicantExpensePrismaRepository extends ApplicantExpenseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: any) {
    return this.prisma.applicantExpense.create({
      data: {
        applicantId: input.applicantId,
        typeId: input.typeId ?? null,
        typeNameOther: input.typeNameOther ?? null,
        amount: input.amount,
        expenseDate: input.expenseDate,
        referenceNo: input.referenceNo ?? null,
        description: input.description ?? null,
        createdBy: input.createdBy ?? null
      },
      include: { type: true, applicant: true }
    });
  }

  update(id: string, input: any) {
    return this.prisma.applicantExpense.update({
      where: { id },
      data: {
        applicantId: input.applicantId === undefined ? undefined : input.applicantId,
        typeId: input.typeId === undefined ? undefined : input.typeId,
        typeNameOther: input.typeNameOther === undefined ? undefined : input.typeNameOther,
        amount: input.amount === undefined ? undefined : input.amount,
        expenseDate: input.expenseDate === undefined ? undefined : input.expenseDate,
        referenceNo: input.referenceNo === undefined ? undefined : input.referenceNo,
        description: input.description === undefined ? undefined : input.description
      },
      include: { type: true, applicant: true }
    });
  }

  async delete(id: string) {
    await this.prisma.applicantExpense.delete({ where: { id } });
  }

  findById(id: string) {
    return this.prisma.applicantExpense.findUnique({ where: { id }, include: { type: true, applicant: true } });
  }

  async list(filters: ApplicantExpenseListFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (filters.applicantId) where.applicantId = filters.applicantId;
    if (filters.typeId) where.typeId = filters.typeId;
    if (filters.from || filters.to) {
      where.expenseDate = {};
      if (filters.from) where.expenseDate.gte = filters.from;
      if (filters.to) where.expenseDate.lte = filters.to;
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantExpense.findMany({
        where,
        include: { type: true, applicant: true },
        orderBy: { expenseDate: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.applicantExpense.count({ where })
    ]);

    return { items, total };
  }
}
