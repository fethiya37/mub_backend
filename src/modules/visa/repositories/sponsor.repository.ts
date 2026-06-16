export type CreateSponsorInput = {
  fullName: string;
  iqamaNumber: string;
  employerId: string;
  phone?: string | null;
  sponsorIdFileUrl?: string | null;
};

export type UpdateSponsorInput = {
  fullName?: string;
  iqamaNumber?: string;
  employerId?: string;
  phone?: string | null;
  sponsorIdFileUrl?: string | null;
};

export type ListSponsorsFilters = {
  q?: string;
  employerId?: string;
};

export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export abstract class SponsorRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract create(input: CreateSponsorInput): Promise<any>;
  abstract update(id: string, input: UpdateSponsorInput): Promise<any>;
  abstract list(
    filters: ListSponsorsFilters,
    page: number,
    pageSize: number,
  ): Promise<ListPage<any>>;
  abstract findByEmployerId(employerId: string): Promise<any[]>;
}
