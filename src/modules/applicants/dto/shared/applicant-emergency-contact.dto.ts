import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ApplicantEmergencyContactDto {
  @ApiProperty({ example: 'Ahmed Seid' })
  @IsString()
  @MinLength(2)
  fullName!: string;

  @ApiProperty({ example: '+251922222222' })
  @IsString()
  @MinLength(6)
  phone!: string;

  @ApiProperty({ example: 'Brother' })
  @IsString()
  relationship!: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  idFile?: any;

  @ApiPropertyOptional({ example: '/uploads/applicants/emergency-contacts/id.pdf', nullable: true })
  @IsOptional()
  @IsString()
  idFileUrl?: string | null;
}
