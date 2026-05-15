import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  NotificationPreferenceRepository,
  NotificationPreferenceCreateInput,
  NotificationPreferenceUpdateInput,
} from '../repositories/notification.repository';

@Injectable()
export class NotificationPreferencePrismaRepository extends NotificationPreferenceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByUserId(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  async upsert(userId: string, input: NotificationPreferenceCreateInput) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        emailEnabled: input.emailEnabled,
        inAppEnabled: input.inAppEnabled,
      },
      create: {
        userId: userId,
        emailEnabled: input.emailEnabled ?? true,
        inAppEnabled: input.inAppEnabled ?? true,
      },
    });
  }

  async update(userId: string, input: NotificationPreferenceUpdateInput) {
    const data: any = {};
    if ('emailEnabled' in input) data.emailEnabled = input.emailEnabled;
    if ('inAppEnabled' in input) data.inAppEnabled = input.inAppEnabled;

    return this.prisma.notificationPreference.update({
      where: { userId },
      data,
    });
  }
}
