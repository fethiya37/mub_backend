export type AccountActionTokenCreate = {
  userId: string;
  type: 'ACCOUNT_SETUP' | 'PASSWORD_RESET' | 'EMAIL_VERIFY';
  tokenHash: string;
  expiresAt: Date;
};

export abstract class AccountActionTokenRepository {
  abstract create(input: AccountActionTokenCreate): Promise<void>;
  abstract findByTokenHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    type: string;
    expiresAt: Date;
    usedAt: Date | null;
  } | null>;
  abstract markUsed(id: string): Promise<void>;
  abstract invalidateAllForUser(userId: string, type: AccountActionTokenCreate['type']): Promise<void>;
}
