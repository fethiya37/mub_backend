import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString } from 'class-validator';

export enum AdminCreateUserRole {
  AGENT = 'AGENT',
  EMPLOYER = 'EMPLOYER',
  APPLICANT = 'APPLICANT'
}

export class AdminCreateUserDto {
  @ApiProperty({ example: '+251922222222' })
  @IsString()
  phone!: string;

  @ApiProperty({ example: 'user@example.com', description: 'Required for account setup via email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: AdminCreateUserRole, example: AdminCreateUserRole.AGENT })
  @IsEnum(AdminCreateUserRole)
  role!: AdminCreateUserRole;
}
