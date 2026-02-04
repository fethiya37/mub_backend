import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CompanyExpenseRepository } from '../repositories/company-expense.repository';
import { CompanyExpenseTypeRepository } from '../repositories/company-expense-type.repository';

@Injectable()
export class CompanyExpensesService {
  constructor(
    private readonly repo: CompanyExpenseRepository,
    private readonly types: CompanyExpenseTypeRepository
  ) {}

  private async ensureTypeExists(typeId: string) {
    const t = await this.types.findById(typeId);
    if (!t) throw new BadRequestException('Invalid typeId');
  }

  async create(createdBy: string, dto: any) {
    if (!dto.typeId && !dto.typeNameOther) {
      throw new BadRequestException('typeNameOther is required when typeId is not provided');
    }
    if (dto.typeId) await this.ensureTypeExists(dto.typeId);

    return this.repo.create({
      typeId: dto.typeId ?? null,
      typeNameOther: dto.typeId ? null : dto.typeNameOther,
      amount: dto.amount,
      expenseDate: new Date(dto.expenseDate),
      referenceNo: dto.referenceNo ?? null,
      description: dto.description ?? null,
      createdBy
    });
  }

  async update(id: string, dto: any) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Expense not found');

    if (dto.typeId === null && !dto.typeNameOther) {
      throw new BadRequestException('typeNameOther is required when typeId is null');
    }
    if (dto.typeId) await this.ensureTypeExists(dto.typeId);

    return this.repo.update(id, {
      typeId: dto.typeId === undefined ? undefined : dto.typeId,
      typeNameOther: dto.typeId ? null : dto.typeNameOther,
      amount: dto.amount,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : undefined,
      referenceNo: dto.referenceNo,
      description: dto.description
    });
  }

  delete(id: string) {
    return this.repo.delete(id);
  }

  list(q: any, page: number, pageSize: number) {
    return this.repo.list(
      {
        typeId: q.typeId,
        from: q.from ? new Date(q.from) : undefined,
        to: q.to ? new Date(q.to) : undefined
      },
      page,
      pageSize
    );
  }
}
