import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class EmployerSelfUpdateDto {
  @ApiPropertyOptional({ example: 'Al Noor Manpower LLC' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  organizationName?: string;

  @ApiPropertyOptional({ example: 'United Arab Emirates' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  country?: string;

  @ApiPropertyOptional({ example: 'hr@alnoor.example' })
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiPropertyOptional({ example: '+971500000000' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  contactPhone?: string;

  @ApiPropertyOptional({ example: 'Dubai, UAE' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'https://files.example.com/employers/logo.png', nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional({ example: 'Ahmed Al Noor' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  ownerName?: string;

  @ApiPropertyOptional({ example: '784-1988-1234567-1', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  ownerIdNumber?: string | null;

  @ApiPropertyOptional({ example: 'https://files.example.com/owners/owner-id.pdf', nullable: true })
  @IsOptional()
  @IsString()
  ownerIdFileUrl?: string | null;

  @ApiPropertyOptional({ example: 'LIC-2025-000123' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  licenseNumber?: string;

  @ApiPropertyOptional({ example: 'https://files.example.com/licenses/lic-2025-000123.pdf' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  licenseFileUrl?: string;

  @ApiPropertyOptional({ example: '2030-12-31', nullable: true })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string | null;
}
