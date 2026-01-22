import { Injectable } from '@nestjs/common';
import { VisaNotificationRepository } from '../repositories/visa-notification.repository';

@Injectable()
export class VisaNotificationsService {
  constructor(private readonly notifications: VisaNotificationRepository) {}

  statusUpdate(visaApplicationId: string, adminUserId: string | null, message: string) {
    return this.notifications.create({
      visaApplicationId,
      adminUserId,
      notificationType: 'STATUS_UPDATE',
      message
    });
  }

  documentRequest(visaApplicationId: string, adminUserId: string | null, message: string) {
    return this.notifications.create({
      visaApplicationId,
      adminUserId,
      notificationType: 'DOCUMENT_REQUEST',
      message
    });
  }

  decisionRecorded(visaApplicationId: string, adminUserId: string | null, message: string) {
    return this.notifications.create({
      visaApplicationId,
      adminUserId,
      notificationType: 'DECISION_RECORDED',
      message
    });
  }

  expiryAlert(visaApplicationId: string, adminUserId: string | null, message: string) {
    return this.notifications.create({
      visaApplicationId,
      adminUserId,
      notificationType: 'EXPIRY_ALERT',
      message
    });
  }

  listByVisa(visaApplicationId: string) {
    return this.notifications.listByVisa(visaApplicationId);
  }
}
