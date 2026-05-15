import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from '../services/notifications.service';
import { UpdateNotificationPreferencesDto } from '../dto/create-notification.dto';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getMyNotifications(
    @CurrentUserDecorator() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
  ) {
    return this.notifications.getUserNotifications(
      user.userId,
      parseInt(page),
      parseInt(limit),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  async getUnreadCount(@CurrentUserDecorator() user: any) {
    const count = await this.notifications.getUnreadCount(user.userId);
    return { count };
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markAsRead(@Param('id') id: string, @CurrentUserDecorator() user: any) {
    return this.notifications.markAsRead(id, user.userId);
  }

  @Patch('mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUserDecorator() user: any) {
    return this.notifications.markAllAsRead(user.userId);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@CurrentUserDecorator() user: any) {
    return this.notifications.getPreferences(user.userId);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUserDecorator() user: any,
    @Body() dto: UpdateNotificationPreferencesDto,
  ) {
    return this.notifications.updatePreferences(
      user.userId,
      dto.emailEnabled ?? true,
      dto.inAppEnabled ?? true,
    );
  }

  @RequirePermissions('SYSTEM_ADMIN')
  @Delete('cleanup')
  @ApiOperation({ summary: 'Delete old notifications (admin only)' })
  async cleanupOldNotifications(@Query('days') days: string = '30') {
    return this.notifications.deleteOldNotifications(parseInt(days));
  }
}
