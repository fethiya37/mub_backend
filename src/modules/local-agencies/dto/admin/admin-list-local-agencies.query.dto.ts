import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { LocalAgencyStatuses } from '../shared/local-agency.enums.dto';

export class AdminListLocalAgenciesQueryDto {
  @ApiPropertyOptional({ enum: LocalAgencyStatuses, example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsString()
  pageSize?: string;
}
