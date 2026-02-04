import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { FlightBookingRepository, type CreateFlightBookingInput } from '../repositories/flight-booking.repository';

@Injectable()
export class FlightBookingPrismaRepository extends FlightBookingRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: CreateFlightBookingInput) {
    return this.prisma.flightBooking.create({
      data: {
        visaCaseId: input.visaCaseId,
        pnr: input.pnr,
        airline: input.airline ?? null,
        departureAt: input.departureAt ?? null,
        arrivalAt: input.arrivalAt ?? null
      }
    });
  }
}
