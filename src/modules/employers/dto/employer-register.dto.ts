import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

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

  @ApiProperty({ example: 'Ahmed Al Noor' })
  @IsString()
  @MinLength(2)
  ownerName!: string;

  @ApiProperty({ example: '784-1988-1234567-1' })
  @IsString()
  @MinLength(3)
  ownerIdNumber!: string;

  @ApiPropertyOptional({ example: 'https://files.example.com/owners/owner-id.pdf' })
  @IsOptional()
  @IsString()
  @IsUrl()
  ownerIdFileUrl?: string;

  @ApiProperty({ example: 'LIC-2025-000123' })
  @IsString()
  @MinLength(3)
  licenseNumber!: string;

  @ApiProperty({ example: 'https://files.example.com/licenses/lic-2025-000123.pdf' })
  @IsString()
  @MinLength(10)
  licenseFileUrl!: string;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;
}
