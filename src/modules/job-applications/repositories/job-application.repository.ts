export type ApplyOrReapplyInput = {
  jobPostingId: string;
  applicantId: string;
  cvFileUrl: string;
};

export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ListMyFilters = {
  status?: string;
  jobPostingId?: string;
};

export type ListAdminFilters = {
  status?: string;
  jobPostingId?: string;
  applicantId?: string;
};

export type ListEmployerFilters = {
  status?: string;
  jobPostingId?: string;
  employerId: string;
};

export abstract class JobApplicationRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract findByApplicantJob(applicantId: string, jobPostingId: string): Promise<any | null>;

  abstract applyOrReapply(input: ApplyOrReapplyInput): Promise<any>;

  abstract updateCv(id: string, cvFileUrl: string): Promise<any>;
  abstract setStatus(id: string, status: string): Promise<any>;

  abstract listMy(applicantId: string, filters: ListMyFilters, page: number, pageSize: number): Promise<ListPage<any>>;
  abstract listAdmin(filters: ListAdminFilters, page: number, pageSize: number): Promise<ListPage<any>>;
  abstract listEmployer(filters: ListEmployerFilters, page: number, pageSize: number): Promise<ListPage<any>>;
}
