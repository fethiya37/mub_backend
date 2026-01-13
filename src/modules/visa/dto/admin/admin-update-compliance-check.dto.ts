import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { VisaComplianceStatuses } from '../shared/visa.enums.dto';

export class AdminUpdateComplianceCheckDto {
  @ApiProperty({ enum: VisaComplianceStatuses })
  @IsString()
  requirementStatus!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
