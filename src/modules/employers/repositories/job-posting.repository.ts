export type JobCreateInput = {
  jobTitle: string;
  jobDescription: string;
  country: string;
  city?: string | null;
  salaryRange?: string | null;
  contractType: 'FULL_TIME' | 'PART_TIME' | 'TEMPORARY' | 'CONTRACT' | 'OTHER';
  status?: 'DRAFT' | 'ACTIVE';
};

export type JobUpdateInput = Partial<JobCreateInput> & {
  status?: 'DRAFT' | 'ACTIVE' | 'CLOSED';
};

export abstract class JobPostingRepository {
  abstract create(employerId: string, input: JobCreateInput): Promise<any>;
  abstract update(jobId: string, input: JobUpdateInput): Promise<any>;
  abstract findById(jobId: string): Promise<any | null>;
  abstract listByEmployer(
    employerId: string,
    status: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;
}
