import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaFingerprintRepository, type UpsertVisaFingerprintInput } from '../repositories/visa-fingerprint.repository';

@Injectable()
export class VisaFingerprintPrismaRepository extends VisaFingerprintRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  upsert(input: UpsertVisaFingerprintInput) {
    return this.prisma.visaFingerprint.upsert({
      where: { visaCaseId: input.visaCaseId },
      create: {
        visaCaseId: input.visaCaseId,
        isDone: input.isDone
      },
      update: {
        isDone: input.isDone
      }
    });
  }
}
