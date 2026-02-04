export type CreateVisaCaseInput = {
  applicantId: string;
  partnerId?: string | null;
  jobId?: string | null;
  destinationCountry: string;
  caseManagerUserId: string;
  sponsorId?: string | null;
};

export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminListVisaCasesFilters = {
  applicantId?: string;
  partnerId?: string;
  jobId?: string;
  status?: string;
  isActive?: boolean;
};

export type ApplicantListVisaCasesFilters = {
  applicantId: string;
  status?: string;
  isActive?: boolean;
};

export type EmployerListVisaCasesFilters = {
  employerId: string;
  jobId?: string;
  status?: string;
  isActive?: boolean;
};

export abstract class VisaCaseRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract create(input: CreateVisaCaseInput): Promise<any>;
  abstract update(id: string, data: any): Promise<any>;
  abstract listAdmin(filters: AdminListVisaCasesFilters, page: number, pageSize: number): Promise<ListPage<any>>;
  abstract listApplicant(filters: ApplicantListVisaCasesFilters, page: number, pageSize: number): Promise<ListPage<any>>;
  abstract listEmployer(filters: EmployerListVisaCasesFilters, page: number, pageSize: number): Promise<ListPage<any>>;
}
