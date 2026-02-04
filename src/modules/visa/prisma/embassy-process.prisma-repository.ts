import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { EmbassyProcessRepository, type UpsertEmbassyProcessInput } from '../repositories/embassy-process.repository';

@Injectable()
export class EmbassyProcessPrismaRepository extends EmbassyProcessRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  upsert(input: UpsertEmbassyProcessInput) {
    return this.prisma.embassyProcess.upsert({
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
