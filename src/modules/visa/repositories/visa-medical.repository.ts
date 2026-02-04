export type UpsertVisaMedicalInput = {
  visaCaseId: string;
  reportFileUrl: string;
  result: 'FIT' | 'UNFIT';
  expiresAt?: Date | null;
};

export abstract class VisaMedicalRepository {
  abstract upsert(input: UpsertVisaMedicalInput): Promise<any>;
}
