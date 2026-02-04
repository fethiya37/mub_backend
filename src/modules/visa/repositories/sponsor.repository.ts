export type CreateSponsorInput = {
  fullName: string;
  sponsorIdFileUrl?: string | null;
  phone?: string | null;
};

export type UpdateSponsorInput = Partial<CreateSponsorInput>;

export abstract class SponsorRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract create(input: CreateSponsorInput): Promise<any>;
  abstract update(id: string, input: UpdateSponsorInput): Promise<any>;
}
