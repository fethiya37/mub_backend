export type ApplicantProfileCreateInput = {
  phone: string;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  dateOfBirth?: Date | null;
  nationality?: string | null;
  passportNumber?: string | null;
  address?: string | null;
  maritalStatus?: string | null;
};

export type ApplicantProfileUpdateInput = Partial<ApplicantProfileCreateInput> & {
  profileStatus?: any;
  submittedAt?: Date | null;
  verifiedAt?: Date | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  userId?: string | null;
};

export abstract class ApplicantProfileRepository {
  abstract create(input: ApplicantProfileCreateInput): Promise<any>;
  abstract findById(applicantId: string): Promise<any | null>;
  abstract findByPhone(phone: string): Promise<any | null>;
  abstract listAll(page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
  abstract listByStatus(status: string, page: number, pageSize: number): Promise<{ items: any[]; total: number }>;
  abstract update(applicantId: string, input: ApplicantProfileUpdateInput): Promise<any>;
}

