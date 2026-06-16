export type CreateContractInput = {
  visaCaseId: string;
  contractNumber: string;
  contractFileUrl: string;
  contractPeriodYears?: number | null;
  monthlySalary?: number | null;
  currency?: string | null;
  sponsorId?: string | null;
};

export type UpdateContractInput = {
  signedFileUrl?: string | null;
  status?: string;
  contractPeriodYears?: number | null;
  monthlySalary?: number | null;
  currency?: string | null;
  signedAt?: Date | null;
  sponsorId?: string | null;
};

export type ListContractsFilters = {
  visaCaseId?: string;
  status?: string;
};

export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export abstract class ContractRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract findByVisaCaseId(visaCaseId: string): Promise<any | null>;
  abstract create(input: CreateContractInput): Promise<any>;
  abstract update(id: string, input: UpdateContractInput): Promise<any>;
  abstract list(
    filters: ListContractsFilters,
    page: number,
    pageSize: number,
  ): Promise<ListPage<any>>;
  abstract countByYearMonth(year: number, month: number): Promise<number>;
}
