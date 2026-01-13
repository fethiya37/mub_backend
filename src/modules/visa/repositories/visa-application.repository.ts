export type VisaApplicationCreate = {
  applicantId: string;
  employerId?: string | null;
  jobId?: string | null;
  visaType: string;
  destinationCountry: string;
  applicationReference?: string | null;
  assignedCaseOfficerId?: string | null;
  remarks?: string | null;
  createdByAdminId: string;
};

export type VisaApplicationUpdate = Partial<{
  employerId: string | null;
  jobId: string | null;
  visaType: string;
  destinationCountry: string;
  applicationReference: string | null;
  assignedCaseOfficerId: string | null;
  remarks: string | null;
}>;

export abstract class VisaApplicationRepository {
  abstract createDraft(input: VisaApplicationCreate): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract updateDraft(id: string, patch: VisaApplicationUpdate): Promise<any>;
  abstract list(
    filters: { status?: string; applicantId?: string; employerId?: string; jobId?: string; destinationCountry?: string; visaType?: string },
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;
  abstract findActiveDuplicate(input: { applicantId: string; destinationCountry: string; visaType: string }): Promise<any | null>;
  abstract setStatus(
    id: string,
    nextStatus: string,
    patch: Partial<{
      submittedByAdminId: string | null;
      submissionDate: Date | null;
      decisionDate: Date | null;
      visaIssueDate: Date | null;
      visaExpiryDate: Date | null;
      remarks: string | null;
    }>
  ): Promise<any>;
  abstract listByApplicant(applicantId: string, status: string | undefined, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
}
