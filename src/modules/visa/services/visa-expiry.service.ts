import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';
import { VisaStatusHistoryRepository } from '../repositories/visa-status-history.repository';
import { VisaNotificationsService } from './visa-notifications.service';

@Injectable()
export class VisaExpiryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly visas: VisaApplicationRepository,
    private readonly history: VisaStatusHistoryRepository,
    private readonly notifications: VisaNotificationsService
  ) {}

  async runDailyExpiryCheck() {
    const now = new Date();

    const approved = await this.prisma.visaApplication.findMany({
      where: { status: 'APPROVED', visaExpiryDate: { not: null } }
    });

    for (const v of approved) {
      if (!v.visaExpiryDate) continue;

      const diffMs = v.visaExpiryDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

      if (diffDays === 30 || diffDays === 14 || diffDays === 7) {
        await this.notifications.expiryAlert(v.id, v.assignedCaseOfficerId ?? null, `Visa expiring in ${diffDays} days`);
      }

      if (v.visaExpiryDate.getTime() <= now.getTime()) {
        await this.visas.setStatus(v.id, 'EXPIRED', { decisionDate: v.decisionDate ?? null });
        await this.history.add({
          visaApplicationId: v.id,
          previousStatus: 'APPROVED',
          newStatus: 'EXPIRED',
          changedByAdminId: null,
          changeReason: 'Auto-expired by system'
        });
      }
    }
  }
}
