export abstract class ApplicantDraftTokenRepository {
  abstract invalidateAll(applicantId: string): Promise<void>;
  abstract create(applicantId: string, tokenHash: string, expiresAt: Date): Promise<any>;
  abstract findValidByHash(tokenHash: string): Promise<any | null>;
  abstract markUsed(id: string): Promise<void>;
}
