import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { VisaStatuses } from '../shared/visa.enums.dto';

export class AdminListVisasQueryDto {
  @ApiPropertyOptional({ required: false, enum: VisaStatuses })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  applicantId?: string;

  @ApiPropertyOptional({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @ApiPropertyOptional({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiPropertyOptional({ required: false, example: 'Saudi' })
  @IsOptional()
  @IsString()
  destinationCountry?: string;

  @ApiPropertyOptional({ required: false, example: 'Work Visa' })
  @IsOptional()
  @IsString()
  visaType?: string;

  @ApiPropertyOptional({ required: false, example: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ required: false, example: 50 })
  @IsOptional()
  @IsString()
  pageSize?: string;
}
