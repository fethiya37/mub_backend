export type UserStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type UserCreateInput = {
  email?: string | null;
  phone: string;
  passwordHash: string;

  isActive: boolean;

  fullName?: string | null;
  status?: UserStatus;

  tokenVersion?: number;

  failedLoginCount?: number;
  lockUntil?: Date | null;

  emailVerified?: boolean;
  emailVerifiedAt?: Date | null;
};

export type UserUpdateInput = {
  email?: string | null;
  phone?: string;
  passwordHash?: string;

  isActive?: boolean;

  fullName?: string | null;
  status?: UserStatus;

  failedLoginCount?: number;
  lockUntil?: Date | null;
  tokenVersion?: number;

  emailVerified?: boolean;
  emailVerifiedAt?: Date | null;
};

export abstract class UserRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract findByIdentifier(identifier: string): Promise<any | null>;

  abstract create(input: UserCreateInput): Promise<any>;
  abstract update(id: string, input: UserUpdateInput): Promise<any>;

  abstract list(page: number, pageSize: number): Promise<{ items: any[]; total: number }>;

  abstract bumpTokenVersion(id: string): Promise<void>;
  abstract setActive(id: string, isActive: boolean): Promise<void>;
}
