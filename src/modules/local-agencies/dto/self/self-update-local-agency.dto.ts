import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class SelfUpdateLocalAgencyDto {
  @ApiPropertyOptional({ example: 'Blue Nile Recruitment PLC' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

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
