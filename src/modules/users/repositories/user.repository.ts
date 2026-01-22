export type UserCreateInput = {
  email?: string | null;
  phone: string;
  passwordHash: string;
  isActive: boolean;
  applicantVerified: boolean;
};

export type UserUpdateInput = Partial<UserCreateInput> & {
  failedLoginCount?: number;
  lockUntil?: Date | null;
  tokenVersion?: number;
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
