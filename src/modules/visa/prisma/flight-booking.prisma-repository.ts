import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { $Enums } from '@prisma/client';
import {
  FlightBookingRepository,
  type CreateFlightBookingInput,
  type UpdateFlightBookingInput,
  type ListFlightBookingsFilters,
  type ListPage,
} from '../repositories/flight-booking.repository';

@Injectable()
export class FlightBookingPrismaRepository extends FlightBookingRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string) {
    return this.prisma.flightBooking.findUnique({
      where: { id },
      include: {
        visaCase: {
          include: {
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            partner: {
              select: {
                organizationName: true,
              },
            },
          },
        },
      },
    });
  }

  async findByVisaCaseId(visaCaseId: string) {
    return this.prisma.flightBooking.findMany({
      where: { visaCaseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(input: CreateFlightBookingInput) {
    return this.prisma.flightBooking.create({
      data: {
        visaCaseId: input.visaCaseId,
        pnr: input.pnr,
        airline: input.airline ?? null,
        ticketNumber: input.ticketNumber ?? null,
        departureAt: input.departureAt ?? null,
        arrivalAt: input.arrivalAt ?? null,
        ticketFileUrl: input.ticketFileUrl ?? null,
        status: input.status ?? 'PENDING',
      },
      include: {
        visaCase: {
          include: {
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, input: UpdateFlightBookingInput) {
    return this.prisma.flightBooking.update({
      where: { id },
      data: {
        pnr: input.pnr,
        airline: input.airline,
        ticketNumber: input.ticketNumber,
        departureAt: input.departureAt,
        arrivalAt: input.arrivalAt,
        ticketFileUrl: input.ticketFileUrl,
        status: input.status,
      },
      include: {
        visaCase: {
          include: {
            applicant: {
              select: {
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
          },
        },
      },
    });
  }

  async list(
    filters: ListFlightBookingsFilters,
    page: number,
    pageSize: number,
  ): Promise<ListPage<any>> {
    const skip = (page - 1) * pageSize;
    const where: any = {};

    if (filters.visaCaseId) where.visaCaseId = filters.visaCaseId;
    if (filters.status) where.status = filters.status;
    if (filters.pnr) where.pnr = { contains: filters.pnr, mode: 'insensitive' };
    if (filters.ticketNumber)
      where.ticketNumber = {
        contains: filters.ticketNumber,
        mode: 'insensitive',
      };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.flightBooking.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          visaCase: {
            include: {
              applicant: {
                select: {
                  firstName: true,
                  lastName: true,
                  phone: true,
                },
              },
              partner: {
                select: {
                  organizationName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.flightBooking.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async updateStatus(id: string, status: $Enums.FlightBookingStatus) {
    return this.prisma.flightBooking.update({
      where: { id },
      data: { status },
    });
  }
}
