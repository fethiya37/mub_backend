export type ApplicantProfileUpsertInput = {
  phone: string;
  email?: string | null;

  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | null;
  nationality?: string | null;
  region?: string | null;

  passportNumber?: string | null;
  passportExpiry?: Date | null;
  laborId?: string | null;

  address?: string | null;
  maritalStatus?: string | null;

  visaNumber?: string | null;
  applicationNumber?: string | null;
  barcodeValue?: string | null;

  registrationSource?: 'SELF' | 'AGENCY' | 'MUB_STAFF' | null;
  createdBy?: string | null;

  skills?: { skillName: string; proficiencyLevel?: string | null; yearsOfExperience?: number | null }[] | undefined;
  qualifications?: { qualificationType: string; institution?: string | null; country?: string | null; yearCompleted?: number | null }[] | undefined;
  workExperiences?: { jobTitle: string; employerName?: string | null; country?: string | null; startDate?: Date | null; endDate?: Date | null; responsibilities?: string | null }[] | undefined;
  documents?: { documentType: any; fileUrl: string; verificationStatus?: string | null }[] | undefined;
};

export abstract class ApplicantProfileRepository {
  abstract findById(applicantId: string): Promise<any | null>;
  abstract findByPhone(phone: string): Promise<any | null>;
  abstract findByUserId(userId: string): Promise<any | null>;

  abstract listByStatus(
    status: string | undefined,
    createdBy: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;

  abstract listByCreator(
    createdBy: string,
    status: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;

  abstract upsertDraft(input: ApplicantProfileUpsertInput): Promise<any>;
  abstract setStatus(applicantId: string, status: any, patch: any): Promise<any>;
  abstract linkUser(applicantId: string, userId: string, verifiedBy: string): Promise<any>;
  abstract updateVerified(applicantId: string, patch: any): Promise<any>;
}
