export type RefreshTokenCreate = {
  userId: string;
  tokenHash: string;
  jti: string;
  expiresAt: Date;
};

export abstract class RefreshTokenRepository {
  abstract create(input: RefreshTokenCreate): Promise<void>;
  abstract findActiveByJti(jti: string): Promise<{ id: string; userId: string; tokenHash: string; expiresAt: Date; revokedAt: Date | null } | null>;
  abstract revoke(id: string): Promise<void>;
  abstract revokeAllForUser(userId: string): Promise<void>;
}
