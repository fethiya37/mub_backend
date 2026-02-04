export type UpsertEmbassyProcessInput = {
  visaCaseId: string;
  status: 'PENDING' | 'COMPLETED';
};

export abstract class EmbassyProcessRepository {
  abstract upsert(input: UpsertEmbassyProcessInput): Promise<any>;
}
