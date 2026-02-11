import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export enum AdminCreateUserRole {
  MUB_STAFF = 'MUB_STAFF',
  FINANCE_OFFICER = 'FINANCE_OFFICER',
  SYSTEM = 'SYSTEM'
}

export class AdminCreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @ApiProperty({ example: '+251922222222' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'staff@mub.example', description: 'Required for account setup via email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: AdminCreateUserRole, example: AdminCreateUserRole.MUB_STAFF })
  @IsEnum(AdminCreateUserRole)
  role!: AdminCreateUserRole;
}
