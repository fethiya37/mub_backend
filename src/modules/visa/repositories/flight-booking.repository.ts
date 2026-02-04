export type CreateFlightBookingInput = {
  visaCaseId: string;
  pnr: string;
  airline?: string | null;
  departureAt?: Date | null;
  arrivalAt?: Date | null;
};

export abstract class FlightBookingRepository {
  abstract create(input: CreateFlightBookingInput): Promise<any>;
}
