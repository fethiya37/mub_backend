import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantExpenseRepository } from '../repositories/applicant-expense.repository';
import { ApplicantExpenseTypeRepository } from '../repositories/applicant-expense-type.repository';
import { ApplicantProfileRepository } from '../../applicants/repositories/applicant-profile.repository';

@Injectable()
export class ApplicantExpensesService {
  constructor(
    private readonly repo: ApplicantExpenseRepository,
    private readonly types: ApplicantExpenseTypeRepository,
    private readonly applicants: ApplicantProfileRepository
  ) {}

  private async ensureTypeExists(typeId: string) {
    const t = await this.types.findById(typeId);
    if (!t) throw new BadRequestException('Invalid typeId');
  }

  private async ensureApplicantExists(applicantId: string) {
    const a = await this.applicants.findById(applicantId);
    if (!a) throw new BadRequestException('Invalid applicantId');
  }

  async create(createdBy: string, dto: any) {
    await this.ensureApplicantExists(dto.applicantId);

    if (!dto.typeId && !dto.typeNameOther) {
      throw new BadRequestException('typeNameOther is required when typeId is not provided');
    }
    if (dto.typeId) await this.ensureTypeExists(dto.typeId);

    return this.repo.create({
      applicantId: dto.applicantId,
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

    if (dto.applicantId) await this.ensureApplicantExists(dto.applicantId);

    if (dto.typeId === null && !dto.typeNameOther) {
      throw new BadRequestException('typeNameOther is required when typeId is null');
    }
    if (dto.typeId) await this.ensureTypeExists(dto.typeId);

    return this.repo.update(id, {
      applicantId: dto.applicantId,
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
        applicantId: q.applicantId,
        typeId: q.typeId,
        from: q.from ? new Date(q.from) : undefined,
        to: q.to ? new Date(q.to) : undefined
      },
      page,
      pageSize
    );
  }
}
