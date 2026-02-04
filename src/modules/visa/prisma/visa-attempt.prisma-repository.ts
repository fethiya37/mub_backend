import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaAttemptRepository, type CreateVisaAttemptInput } from '../repositories/visa-attempt.repository';

@Injectable()
export class VisaAttemptPrismaRepository extends VisaAttemptRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async maxAttemptNumber(visaCaseId: string) {
    const r = await this.prisma.visaAttempt.aggregate({
      where: { visaCaseId },
      _max: { attemptNumber: true }
    });
    return r._max.attemptNumber ?? 0;
  }

  create(input: CreateVisaAttemptInput) {
    return this.prisma.visaAttempt.create({
      data: {
        visaCaseId: input.visaCaseId,
        attemptNumber: input.attemptNumber,
        status: input.status,
        applicationNumber: input.applicationNumber ?? null,
        visaNumber: input.visaNumber ?? null,
        issuedAt: input.issuedAt ?? null,
        expiresAt: input.expiresAt ?? null,
        rejectionReason: input.rejectionReason ?? null,
        barcodeValue: input.barcodeValue ?? null,
        barcodeImageUrl: input.barcodeImageUrl ?? null
      }
    });
  }
}
