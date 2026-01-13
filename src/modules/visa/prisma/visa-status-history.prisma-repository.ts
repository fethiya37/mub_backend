import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaStatusHistoryCreate, VisaStatusHistoryRepository } from '../repositories/visa-status-history.repository';

@Injectable()
export class VisaStatusHistoryPrismaRepository extends VisaStatusHistoryRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async add(input: VisaStatusHistoryCreate) {
    await this.prisma.visaStatusHistory.create({
      data: {
        visaApplicationId: input.visaApplicationId,
        previousStatus: (input.previousStatus ?? null) as any,
        newStatus: input.newStatus as any,
        changedByAdminId: input.changedByAdminId ?? null,
        changeReason: input.changeReason ?? null
      }
    });
  }

  listByVisa(visaApplicationId: string) {
    return this.prisma.visaStatusHistory.findMany({
      where: { visaApplicationId },
      orderBy: { changedAt: 'desc' }
    });
  }
}
