import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export enum AdminCreateUserRole {
  AGENT = 'AGENT',
  PARTNER = 'PARTNER',
  APPLICANT = 'APPLICANT'
}

export class AdminCreateUserDto {
  @ApiProperty({ example: '+251922222222' })
  @IsString()
  phone!: string;

  @ApiPropertyOptional({ example: 'agent@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ enum: AdminCreateUserRole, example: AdminCreateUserRole.AGENT })
  @IsEnum(AdminCreateUserRole)
  role!: AdminCreateUserRole;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  defaultPasswordIsPhone?: boolean;
}
