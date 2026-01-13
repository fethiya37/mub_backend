import { ApiProperty } from '@nestjs/swagger';
import { VisaNotificationTypes } from './visa.enums.dto';

export class VisaNotificationResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  visaApplicationId!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  adminUserId?: string | null;

  @ApiProperty({ enum: VisaNotificationTypes })
  notificationType!: string;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty()
  createdAt!: string;
}
