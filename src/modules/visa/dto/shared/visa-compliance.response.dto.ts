import { ApiProperty } from '@nestjs/swagger';
import { VisaComplianceStatuses } from './visa.enums.dto';

export class VisaComplianceResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  visaApplicationId!: string;

  @ApiProperty()
  requirementType!: string;

  @ApiProperty({ enum: VisaComplianceStatuses })
  requirementStatus!: string;

  @ApiProperty({ required: false })
  remarks?: string | null;

  @ApiProperty({ required: false, format: 'uuid' })
  checkedByAdminId?: string | null;

  @ApiProperty({ required: false })
  checkedAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}
