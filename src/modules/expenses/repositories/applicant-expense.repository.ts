export type ApplicantExpenseCreateInput = {
  applicantId: string;
  typeId?: string | null;
  typeNameOther?: string | null;
  amount: string;
  expenseDate: Date;
  referenceNo?: string | null;
  description?: string | null;
  createdBy?: string | null;
};

export type ApplicantExpenseUpdateInput = Partial<Omit<ApplicantExpenseCreateInput, 'createdBy'>> & {
  typeId?: string | null;
  typeNameOther?: string | null;
};

export type ApplicantExpenseListFilters = {
  applicantId?: string;
  typeId?: string;
  from?: Date;
  to?: Date;
};

export abstract class ApplicantExpenseRepository {
  abstract create(input: ApplicantExpenseCreateInput): Promise<any>;
  abstract update(id: string, input: ApplicantExpenseUpdateInput): Promise<any>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<any | null>;
  abstract list(filters: ApplicantExpenseListFilters, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
}
