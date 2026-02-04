import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaInsuranceRepository, type UpsertVisaInsuranceInput } from '../repositories/visa-insurance.repository';

@Injectable()
export class VisaInsurancePrismaRepository extends VisaInsuranceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  upsert(input: UpsertVisaInsuranceInput) {
    return this.prisma.visaInsurance.upsert({
      where: { visaCaseId: input.visaCaseId },
      create: {
        visaCaseId: input.visaCaseId,
        providerName: input.providerName ?? null,
        policyNumber: input.policyNumber ?? null,
        policyFileUrl: input.policyFileUrl ?? null
      },
      update: {
        providerName: input.providerName ?? null,
        policyNumber: input.policyNumber ?? null,
        policyFileUrl: input.policyFileUrl ?? null
      }
    });
  }
}
