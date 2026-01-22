export type LocalAgencyCreateInput = {
  name: string;
  licenseNumber: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type LocalAgencyUpdateInput = Partial<{
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;

  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

  userId: string | null;

  rejectionReason: string | null;

  approvedBy: string | null;
  approvedAt: Date | null;

  suspendedAt: Date | null;
}>;

export abstract class LocalAgencyRepository {
  abstract create(input: LocalAgencyCreateInput): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract findByLicenseNumber(licenseNumber: string): Promise<any | null>;
  abstract findByUserId(userId: string): Promise<any | null>;
  abstract listByStatus(
    status: string | undefined,
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;
  abstract update(id: string, input: LocalAgencyUpdateInput): Promise<any>;
}
