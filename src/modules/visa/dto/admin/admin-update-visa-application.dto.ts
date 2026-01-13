import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AdminUpdateVisaApplicationDto {
  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ required: false, example: 'Work Visa' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  visaType?: string;

  @ApiProperty({ required: false, example: 'Saudi Arabia' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  destinationCountry?: string;

  @ApiProperty({ required: false, example: 'REF-2026-001' })
  @IsOptional()
  @IsString()
  applicationReference?: string;

  @ApiProperty({ required: false, description: 'UserId of assigned case officer', format: 'uuid' })
  @IsOptional()
  @IsUUID()
  assignedCaseOfficerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  remarks?: string;
}
