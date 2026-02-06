export type EmployerCreateInput = {
  organizationName: string;
  country: string;
  contactEmail: string;
  contactPhone: string;
  registrationNumber: string;
  address?: string | null;

  logoUrl?: string | null;

  ownerName: string;
  ownerIdNumber?: string | null;
  ownerIdFileUrl?: string | null;

  licenseNumber: string;
  licenseFileUrl: string;
  licenseExpiry?: Date | null;

  createdBy: 'EMPLOYER' | 'ADMIN';
};

export type EmployerUpdateInput = Partial<Omit<EmployerCreateInput, 'registrationNumber' | 'createdBy'>> & {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  userId?: string | null;
};

export abstract class EmployerRepository {
  abstract create(input: EmployerCreateInput): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract findByContactEmail(email: string): Promise<any | null>;
  abstract findByContactPhone(phone: string): Promise<any | null>;
  abstract findByUserId(userId: string): Promise<any | null>;
  abstract findByLicenseNumber(licenseNumber: string): Promise<any | null>;
  abstract findByOwnerIdNumber(ownerIdNumber: string): Promise<any | null>;
  abstract list(
    filters: { status?: string; country?: string },
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;
  abstract update(id: string, input: EmployerUpdateInput): Promise<any>;
}
