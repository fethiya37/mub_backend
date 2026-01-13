import { Injectable } from '@nestjs/common';
import { VisaNotificationRepository } from '../repositories/visa-notification.repository';

@Injectable()
export class VisaNotificationsService {
  constructor(private readonly repo: VisaNotificationRepository) {}

  statusUpdate(visaId: string, adminUserId: string | null | undefined, message: string) {
    return this.repo.create({
      visaApplicationId: visaId,
      adminUserId: adminUserId ?? null,
      notificationType: 'STATUS_UPDATE',
      message
    });
  }

  documentRequest(visaId: string, adminUserId: string | null | undefined, message: string) {
    return this.repo.create({
      visaApplicationId: visaId,
      adminUserId: adminUserId ?? null,
      notificationType: 'DOCUMENT_REQUEST',
      message
    });
  }

  decisionRecorded(visaId: string, adminUserId: string | null | undefined, message: string) {
    return this.repo.create({
      visaApplicationId: visaId,
      adminUserId: adminUserId ?? null,
      notificationType: 'DECISION_RECORDED',
      message
    });
  }

  expiryAlert(visaId: string, adminUserId: string | null | undefined, message: string) {
    return this.repo.create({
      visaApplicationId: visaId,
      adminUserId: adminUserId ?? null,
      notificationType: 'EXPIRY_ALERT',
      message
    });
  }
}
