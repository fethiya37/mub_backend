import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaNotificationCreate, VisaNotificationRepository } from '../repositories/visa-notification.repository';

@Injectable()
export class VisaNotificationPrismaRepository extends VisaNotificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: VisaNotificationCreate) {
    return this.prisma.visaNotification.create({
      data: {
        visaApplicationId: input.visaApplicationId,
        adminUserId: input.adminUserId ?? null,
        notificationType: input.notificationType as any,
        message: input.message
      }
    });
  }

  listByVisa(visaApplicationId: string) {
    return this.prisma.visaNotification.findMany({
      where: { visaApplicationId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
