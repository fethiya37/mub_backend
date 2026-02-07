import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class AdminUpsertSponsorDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  sponsorIdFile?: any;

  @ApiPropertyOptional({ example: '/uploads/visa/sponsors/id.jpg' })
  @IsOptional()
  @IsString()
  sponsorIdFileUrl?: string;

  @ApiPropertyOptional({ example: '+2519xxxxxxx' })
  @IsOptional()
  @IsString()
  phone?: string;
}
