import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class AdminUpsertSponsorDto {
  @ApiProperty()
  @IsString()
  fullName!: string;

  @ApiProperty()
  @IsString()
  iqamaNumber!: string;

  @ApiProperty()
  @IsUUID()
  employerId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  sponsorIdFile?: any;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sponsorIdFileUrl?: string;
}
