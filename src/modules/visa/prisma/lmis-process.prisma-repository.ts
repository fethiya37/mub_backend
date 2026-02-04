import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { LMISProcessRepository, type UpsertLMISProcessInput } from '../repositories/lmis-process.repository';

@Injectable()
export class LMISProcessPrismaRepository extends LMISProcessRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  upsert(input: UpsertLMISProcessInput) {
    return this.prisma.lMISProcess.upsert({
      where: { visaCaseId: input.visaCaseId },
      create: {
        visaCaseId: input.visaCaseId,
        status: input.status
      },
      update: {
        status: input.status
      }
    });
  }
}
