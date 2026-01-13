import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { VisaStatuses } from '../shared/visa.enums.dto';

export class AdminUpdateVisaStatusDto {
  @ApiProperty({ enum: VisaStatuses })
  @IsString()
  status!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  reason?: string;
}
