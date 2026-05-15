import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import {
  NotificationRepository,
  NotificationCreateInput,
  NotificationUpdateInput,
} from '../repositories/notification.repository';

@Injectable()
export class NotificationPrismaRepository extends NotificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: NotificationCreateInput) {
    return this.prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        isRead: input.isRead ?? false,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId } }),
    ]);

    return { items, total };
  }

  async countUnreadByUserId(userId: string) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async update(id: string, input: NotificationUpdateInput) {
    const data: any = {};
    if ('isRead' in input) data.isRead = input.isRead;

    return this.prisma.notification.update({
      where: { id },
      data,
    });
  }

  async updateManyByUserId(userId: string, input: NotificationUpdateInput) {
    const data: any = {};
    if ('isRead' in input) data.isRead = input.isRead;

    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data,
    });

    return { count: result.count };
  }

  async deleteOld(daysOld: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });

    return result.count;
  }
}
