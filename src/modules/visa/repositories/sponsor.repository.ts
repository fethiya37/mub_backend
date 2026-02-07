export type CreateSponsorInput = {
  fullName: string;
  sponsorIdFileUrl?: string | null;
  phone?: string | null;
};

export type UpdateSponsorInput = Partial<CreateSponsorInput>;

export type SponsorListFilters = {
  q?: string;
};

export abstract class SponsorRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract create(input: CreateSponsorInput): Promise<any>;
  abstract update(id: string, input: UpdateSponsorInput): Promise<any>;
  abstract list(
    filters: SponsorListFilters,
    page: number,
    pageSize: number
  ): Promise<{ items: any[]; total: number }>;
}
