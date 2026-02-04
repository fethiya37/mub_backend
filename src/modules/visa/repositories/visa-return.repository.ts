export type CreateVisaReturnInput = {
  visaCaseId: string;
  reason: string;
};

export abstract class VisaReturnRepository {
  abstract create(input: CreateVisaReturnInput): Promise<any>;
}
