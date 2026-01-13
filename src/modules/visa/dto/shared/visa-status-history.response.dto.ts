import { ApiProperty } from '@nestjs/swagger';
import { VisaStatuses } from './visa.enums.dto';

export class VisaStatusHistoryResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  visaApplicationId!: string;

  @ApiProperty({ required: false, enum: VisaStatuses })
  previousStatus?: string | null;

  @ApiProperty({ enum: VisaStatuses })
  newStatus!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  changedByAdminId?: string | null;

  @ApiProperty({ required: false })
  changeReason?: string | null;

  @ApiProperty()
  changedAt!: string;
}
