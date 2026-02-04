import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaMedicalRepository, type UpsertVisaMedicalInput } from '../repositories/visa-medical.repository';

@Injectable()
export class VisaMedicalPrismaRepository extends VisaMedicalRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  upsert(input: UpsertVisaMedicalInput) {
    return this.prisma.visaMedical.upsert({
      where: { visaCaseId: input.visaCaseId },
      create: {
        visaCaseId: input.visaCaseId,
        reportFileUrl: input.reportFileUrl,
        result: input.result,
        expiresAt: input.expiresAt ?? null
      },
      update: {
        reportFileUrl: input.reportFileUrl,
        result: input.result,
        expiresAt: input.expiresAt ?? null
      }
    });
  }
}
