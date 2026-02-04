export type CompanyExpenseCreateInput = {
  typeId?: string | null;
  typeNameOther?: string | null;
  amount: string; // decimal string
  expenseDate: Date;
  referenceNo?: string | null;
  description?: string | null;
  createdBy?: string | null;
};

export type CompanyExpenseUpdateInput = Partial<Omit<CompanyExpenseCreateInput, 'createdBy'>> & {
  typeId?: string | null;
  typeNameOther?: string | null;
};

export type CompanyExpenseListFilters = {
  typeId?: string;
  from?: Date;
  to?: Date;
};

export abstract class CompanyExpenseRepository {
  abstract create(input: CompanyExpenseCreateInput): Promise<any>;
  abstract update(id: string, input: CompanyExpenseUpdateInput): Promise<any>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<any | null>;
  abstract list(filters: CompanyExpenseListFilters, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
}
