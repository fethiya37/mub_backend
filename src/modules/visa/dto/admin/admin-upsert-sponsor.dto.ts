import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class AdminUpsertSponsorDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiPropertyOptional({ example: 'https://cdn.site.com/id.jpg' })
  @IsOptional()
  @IsString()
  @IsUrl()
  sponsorIdFileUrl?: string;

  @ApiPropertyOptional({ example: '+2519xxxxxxx' })
  @IsOptional()
  @IsString()
  phone?: string;
}
