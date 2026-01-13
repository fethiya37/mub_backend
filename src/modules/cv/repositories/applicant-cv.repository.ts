export type ApplicantCvCreate = {
  applicantId: string;
  jobId?: string | null;
  cvTemplateId: string;
};

export abstract class ApplicantCvRepository {
  abstract create(input: ApplicantCvCreate): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract findByApplicant(applicantId: string, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
  abstract findByApplicantAndJob(applicantId: string, jobId: string): Promise<any | null>;
  abstract listForAdmin(
    filters: { status?: string; applicantId?: string; jobId?: string },
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;
  abstract update(id: string, patch: any): Promise<any>;
}
