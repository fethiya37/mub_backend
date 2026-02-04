export type ApplicantExpenseTypeCreateInput = { name: string };
export type ApplicantExpenseTypeUpdateInput = { name?: string };

export abstract class ApplicantExpenseTypeRepository {
  abstract create(input: ApplicantExpenseTypeCreateInput): Promise<any>;
  abstract update(id: string, input: ApplicantExpenseTypeUpdateInput): Promise<any>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<any | null>;
  abstract list(): Promise<any[]>;
}
