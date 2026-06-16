import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  NotificationRepository,
  NotificationPreferenceRepository,
} from '../repositories/notification.repository';
import { NotificationGateway } from '../gateways/notification.gateway';
import { MailService } from '../../mail/services/mail.service';
import {
  NOTIFICATION_TYPES,
  NotificationType,
} from '../constants/notification-types.constant';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private notificationRepo: NotificationRepository,
    private preferenceRepo: NotificationPreferenceRepository,
    private notificationGateway: NotificationGateway,
    private mailService: MailService,
    private prisma: PrismaService,
  ) {}

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ) {
    const preferences = await this.preferenceRepo.findByUserId(userId);

    let preferencesData = preferences;
    if (!preferencesData) {
      preferencesData = await this.preferenceRepo.upsert(userId, { userId });
    }

    const notification = await this.notificationRepo.create({
      userId,
      type,
      title,
      message,
    });

    if (preferencesData.inAppEnabled) {
      this.notificationGateway.sendNotificationToUser(userId, notification);
    }

    if (preferencesData.emailEnabled) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, fullName: true },
      });

      if (user?.email && user.email.trim().length > 0) {
        await this.mailService.sendNotificationEmail(
          user.email,
          user.fullName || 'User',
          title,
          message,
          type,
        );
      } else {
        this.logger.warn(
          `User ${userId} has no email address, skipping email notification`,
        );
      }
    }

    const unreadCount = await this.notificationRepo.countUnreadByUserId(userId);
    this.notificationGateway.sendUnreadCountToUser(userId, unreadCount);

    return notification;
  }

  async getPreferences(userId: string) {
    let preferences = await this.preferenceRepo.findByUserId(userId);

    if (!preferences) {
      preferences = await this.preferenceRepo.upsert(userId, { userId });
    }

    return preferences;
  }

  async updatePreferences(
    userId: string,
    emailEnabled: boolean,
    inAppEnabled: boolean,
  ) {
    const existing = await this.preferenceRepo.findByUserId(userId);

    if (!existing) {
      return this.preferenceRepo.upsert(userId, {
        userId,
        emailEnabled,
        inAppEnabled,
      });
    }

    return this.preferenceRepo.update(userId, { emailEnabled, inAppEnabled });
  }

  async getUnreadCount(userId: string) {
    return this.notificationRepo.countUnreadByUserId(userId);
  }

  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepo.findById(notificationId);

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    await this.notificationRepo.update(notificationId, { isRead: true });

    const unreadCount = await this.notificationRepo.countUnreadByUserId(userId);
    this.notificationGateway.sendUnreadCountToUser(userId, unreadCount);

    return { success: true };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepo.updateManyByUserId(userId, { isRead: true });
    this.notificationGateway.sendUnreadCountToUser(userId, 0);
    return { success: true };
  }

  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    const result = await this.notificationRepo.findByUserId(
      userId,
      page,
      limit,
    );

    return {
      data: result.items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  async deleteOldNotifications(daysOld: number = 30) {
    const count = await this.notificationRepo.deleteOld(daysOld);
    this.logger.log(`Deleted ${count} old notifications`);
    return { deleted: count };
  }
}
