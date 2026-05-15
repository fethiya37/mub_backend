export type NotificationCreateInput = {
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
};

export type NotificationUpdateInput = {
  isRead?: boolean;
};

export type NotificationPreferenceCreateInput = {
  userId: string;
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
};

export type NotificationPreferenceUpdateInput = {
  emailEnabled?: boolean;
  inAppEnabled?: boolean;
};

export abstract class NotificationRepository {
  abstract create(input: NotificationCreateInput): Promise<any>;
  abstract findById(id: string): Promise<any | null>;
  abstract findByUserId(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: any[]; total: number }>;
  abstract countUnreadByUserId(userId: string): Promise<number>;
  abstract update(id: string, input: NotificationUpdateInput): Promise<any>;
  abstract updateManyByUserId(
    userId: string,
    input: NotificationUpdateInput,
  ): Promise<{ count: number }>;
  abstract deleteOld(daysOld: number): Promise<number>;
}

export abstract class NotificationPreferenceRepository {
  abstract findByUserId(userId: string): Promise<any | null>;
  abstract upsert(
    userId: string,
    input: NotificationPreferenceCreateInput,
  ): Promise<any>;
  abstract update(
    userId: string,
    input: NotificationPreferenceUpdateInput,
  ): Promise<any>;
}
