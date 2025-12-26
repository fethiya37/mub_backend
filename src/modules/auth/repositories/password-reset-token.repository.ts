export type PasswordResetCreate = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export abstract class PasswordResetTokenRepository {
  abstract create(input: PasswordResetCreate): Promise<void>;
  abstract findValidByTokenHash(tokenHash: string): Promise<{ id: string; userId: string; expiresAt: Date; usedAt: Date | null } | null>;
  abstract markUsed(id: string): Promise<void>;
  abstract invalidateAllForUser(userId: string): Promise<void>;
}
