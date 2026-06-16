import { type $Enums } from '@prisma/client';

export type CreateFlightBookingInput = {
  visaCaseId: string;
  pnr: string;
  airline?: string | null;
  ticketNumber?: string | null;
  departureAt?: Date | null;
  arrivalAt?: Date | null;
  ticketFileUrl?: string | null;
  status?: $Enums.FlightBookingStatus;
};

export type UpdateFlightBookingInput = {
  pnr?: string;
  airline?: string | null;
  ticketNumber?: string | null;
  departureAt?: Date | null;
  arrivalAt?: Date | null;
  ticketFileUrl?: string | null;
  status?: $Enums.FlightBookingStatus;
};

export type ListFlightBookingsFilters = {
  visaCaseId?: string;
  status?: string;
  pnr?: string;
  ticketNumber?: string;
};

export type ListPage<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export abstract class FlightBookingRepository {
  abstract findById(id: string): Promise<any | null>;
  abstract findByVisaCaseId(visaCaseId: string): Promise<any[]>;
  abstract create(input: CreateFlightBookingInput): Promise<any>;
  abstract update(id: string, input: UpdateFlightBookingInput): Promise<any>;
  abstract list(
    filters: ListFlightBookingsFilters,
    page: number,
    pageSize: number,
  ): Promise<ListPage<any>>;
  abstract updateStatus(
    id: string,
    status: $Enums.FlightBookingStatus,
  ): Promise<any>;
}
