export abstract class ApplicantDocumentRepository {
  abstract add(applicantId: string, input: { documentType: string; fileUrl: string; verificationStatus?: string | null }): Promise<any>;
  abstract update(id: string, input: { fileUrl?: string | null; verificationStatus?: string | null }): Promise<any>;
  abstract remove(id: string): Promise<void>;
}
