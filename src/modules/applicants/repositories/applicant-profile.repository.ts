export type ApplicantProfileUpsertInput = {
  phone: string;
  applicationNumber?: string;

  email?: string | undefined;

  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  gender?: string | null;

  dateOfBirth?: Date | null;
  placeOfBirth?: string | null;
  nationality?: string | null;
  religion?: string | null;
  maritalStatus?: string | null;
  numberOfChildren?: number | null;

  occupation?: string | null;

  height?: number | null;
  weight?: number | null;

  laborId?: string | null;

  passportNumber?: string | null;
  passportPlace?: string | null;
  passportIssueDate?: Date | null;
  passportExpiry?: Date | null;

  address?: string | null;

  registrationSource?: 'SELF' | 'AGENCY' | 'MUB_STAFF' | null;
  createdBy?: string | null;

  emergencyContacts?:
  | {
    fullName: string;
    phone: string;
    relationship: string;
    address?: string | null;
    idFileUrl?: string | null;
  }[]
  | undefined;

  skills?: { skillId: string; hasSkill?: boolean; willingToLearn?: boolean }[] | undefined;

  qualifications?: { qualification: string }[] | undefined;

  workExperiences?: { jobTitle: string; country?: string | null; yearsWorked?: number | null }[] | undefined;

  documents?: { documentType: any; fileUrl: string; status?: string | null }[] | undefined;
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
