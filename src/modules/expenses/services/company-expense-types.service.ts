import { BadRequestException, Injectable } from '@nestjs/common';
import { CompanyExpenseTypeRepository } from '../repositories/company-expense-type.repository';

@Injectable()
export class CompanyExpenseTypesService {
  constructor(private readonly repo: CompanyExpenseTypeRepository) {}

  list() {
    return this.repo.list();
  }

  create(name: string) {
    return this.repo.create({ name: name.trim() });
  }

  update(id: string, name?: string) {
    if (!name) throw new BadRequestException('name is required');
    return this.repo.update(id, { name: name.trim() });
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}

