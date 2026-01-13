export type VisaNotificationCreate = {
  visaApplicationId: string;
  adminUserId?: string | null;
  notificationType: string;
  message: string;
};

export abstract class VisaNotificationRepository {
  abstract create(input: VisaNotificationCreate): Promise<any>;
  abstract listByVisa(visaApplicationId: string): Promise<any[]>;
}
