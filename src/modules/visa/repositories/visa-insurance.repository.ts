export type UpsertVisaInsuranceInput = {
  visaCaseId: string;
  providerName?: string | null;
  policyNumber?: string | null;
  policyFileUrl?: string | null;
};

export abstract class VisaInsuranceRepository {
  abstract upsert(input: UpsertVisaInsuranceInput): Promise<any>;
}
