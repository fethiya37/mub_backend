import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationGateway } from './gateways/notification.gateway';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './presentation/notifications.controller';
import {
  NotificationRepository,
  NotificationPreferenceRepository,
} from './repositories/notification.repository';
import { NotificationPrismaRepository } from './prisma/notification.prisma-repository';
import { NotificationPreferencePrismaRepository } from './prisma/notification-preference.prisma-repository';
import { PrismaModule } from '../../database/prisma.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    NotificationGateway,
    NotificationsService,
    {
      provide: NotificationRepository,
      useClass: NotificationPrismaRepository,
    },
    {
      provide: NotificationPreferenceRepository,
      useClass: NotificationPreferencePrismaRepository,
    },
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
