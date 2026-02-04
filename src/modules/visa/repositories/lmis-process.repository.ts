export type UpsertLMISProcessInput = {
  visaCaseId: string;
  status: 'PENDING' | 'ISSUED' | 'REJECTED';
};

export abstract class LMISProcessRepository {
  abstract upsert(input: UpsertLMISProcessInput): Promise<any>;
}
