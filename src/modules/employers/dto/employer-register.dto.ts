import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class EmployerRegisterDto {
  @ApiProperty({ example: 'Al Noor Manpower LLC' })
  @IsString()
  @MinLength(2)
  organizationName!: string;

  @ApiProperty({ example: 'United Arab Emirates' })
  @IsString()
  @MinLength(2)
  country!: string;

  @ApiProperty({ example: 'hr@alnoor.example' })
  @IsEmail()
  contactEmail!: string;

  @ApiProperty({ example: '+971500000000' })
  @IsString()
  @MinLength(6)
  contactPhone!: string;

  @ApiPropertyOptional({ example: 'Dubai, UAE' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  logo?: any;

  @ApiPropertyOptional({ example: '/uploads/employers/logos/logo.png', nullable: true })
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiProperty({ example: 'Ahmed Al Noor' })
  @IsString()
  @MinLength(2)
  ownerName!: string;

  @ApiPropertyOptional({ example: '784-1988-1234567-1', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(3)
  ownerIdNumber?: string | null;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  ownerIdFile?: any;

  @ApiPropertyOptional({ example: '/uploads/employers/owners/owner-id.pdf', nullable: true })
  @IsOptional()
  @IsString()
  ownerIdFileUrl?: string | null;

  @ApiProperty({ example: 'LIC-2025-000123' })
  @IsString()
  @MinLength(3)
  licenseNumber!: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  licenseFile?: any;

  @ApiPropertyOptional({ example: '/uploads/employers/licenses/lic-2025-000123.pdf', nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(2)
  licenseFileUrl?: string | null;

  @ApiPropertyOptional({ example: '2030-12-31', nullable: true })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string | null;
}
