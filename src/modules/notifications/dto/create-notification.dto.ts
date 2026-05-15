import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import type { NotificationType } from '../constants/notification-types.constant';
import { NOTIFICATION_TYPES } from '../constants/notification-types.constant';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({ enum: Object.values(NOTIFICATION_TYPES) })
  @IsString()
  @IsNotEmpty()
  type!: NotificationType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message!: string;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  inAppEnabled?: boolean;
}
