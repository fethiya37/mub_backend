import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApplicantProfileStatuses } from '../shared/enums.dto';

export class AgentListApplicantsQueryDto {
  @ApiPropertyOptional({ example: 'SUBMITTED', enum: ApplicantProfileStatuses })
  @IsOptional()
  @IsIn(ApplicantProfileStatuses)
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
