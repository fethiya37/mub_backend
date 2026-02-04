import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaReturnRepository, type CreateVisaReturnInput } from '../repositories/visa-return.repository';

@Injectable()
export class VisaReturnPrismaRepository extends VisaReturnRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: CreateVisaReturnInput) {
    return this.prisma.visaReturn.create({
      data: {
        visaCaseId: input.visaCaseId,
        reason: input.reason
      }
    });
  }
}
