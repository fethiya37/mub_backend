import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class AdminCreateLocalAgencyDto {
  @ApiProperty({ example: 'Blue Nile Recruitment PLC' })
  @IsString()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'LIC-ETH-2026-000145' })
  @IsString()
  @MinLength(2)
  licenseNumber!: string;

  @ApiPropertyOptional({ example: 'Abebe Kebede' })
  @IsOptional()
  @IsString()
  contactPerson?: string;

  @ApiPropertyOptional({ example: '+251911234567' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ example: 'agency@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
