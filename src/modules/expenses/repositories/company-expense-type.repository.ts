export type CompanyExpenseTypeCreateInput = { name: string };
export type CompanyExpenseTypeUpdateInput = { name?: string };

export abstract class CompanyExpenseTypeRepository {
  abstract create(input: CompanyExpenseTypeCreateInput): Promise<any>;
  abstract update(id: string, input: CompanyExpenseTypeUpdateInput): Promise<any>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<any | null>;
  abstract list(): Promise<any[]>;
}
