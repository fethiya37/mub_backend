export type UpsertVisaFingerprintInput = {
  visaCaseId: string;
  isDone: boolean;
};

export abstract class VisaFingerprintRepository {
  abstract upsert(input: UpsertVisaFingerprintInput): Promise<any>;
}
