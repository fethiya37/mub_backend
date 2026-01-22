export type VisaApplicationCreate = {
  applicantId: string;
  employerId?: string | null;
  jobId?: string | null;
  visaType: string;
  destinationCountry: string;
  applicationReference?: string | null;
  assignedCaseOfficerId?: string | null;
  remarks?: string | null;
};

export type VisaApplicationUpdate = Partial<Omit<VisaApplicationCreate, 'applicantId'>> & {
  status?: string;
  submittedByAdminId?: string | null;
  submissionDate?: Date | null;
  decisionDate?: Date | null;
  visaIssueDate?: Date | null;
  visaExpiryDate?: Date | null;
};

export abstract class VisaApplicationRepository {
  abstract createDraft(input: VisaApplicationCreate): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract updateDraft(id: string, patch: VisaApplicationUpdate): Promise<any>;
  abstract setStatus(id: string, nextStatus: string, patch: VisaApplicationUpdate): Promise<any>;
  abstract list(filters: any, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
  abstract listByApplicant(applicantId: string, status: string | undefined, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
  abstract findActiveDuplicate(input: { applicantId: string; destinationCountry: string; visaType: string }): Promise<any | null>;
}
