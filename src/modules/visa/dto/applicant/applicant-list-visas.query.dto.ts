import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { VisaStatuses } from '../shared/visa.enums.dto';

export class ApplicantListVisasQueryDto {
  @ApiPropertyOptional({ required: false, enum: VisaStatuses })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ required: false, example: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ required: false, example: 50 })
  @IsOptional()
  @IsString()
  pageSize?: string;
}
