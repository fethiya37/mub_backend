export type VisaDocumentCreate = {
  visaApplicationId: string;
  documentType: string;
  fileUrl: string;
  fileHash?: string | null;
  uploadedByAdminId?: string | null;
};

export type VisaDocumentVerify = {
  verificationStatus: string;
  verificationReason?: string | null;
  verifiedByAdminId?: string | null;
  verifiedAt?: Date | null;
};

export abstract class VisaDocumentRepository {
  abstract uploadNewVersion(input: VisaDocumentCreate): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract listByVisa(visaApplicationId: string): Promise<any[]>;
  abstract setVerification(id: string, patch: VisaDocumentVerify): Promise<any>;
}
