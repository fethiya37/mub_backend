import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class AdminUpsertInsuranceDto {
  @ApiProperty()
  @IsString()
  @MinLength(5)
  visaCaseId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  policyNumber?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  policyFile?: any;

  @ApiPropertyOptional({ example: '/uploads/visa/insurance/policy.pdf', nullable: true })
  @IsOptional()
  @IsString()
  policyFileUrl?: string | null;
}
