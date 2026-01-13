import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class AdminCreateVisaApplicationDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  applicantId!: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  employerId?: string;

  @ApiProperty({ required: false, format: 'uuid' })
  @IsOptional()
  @IsUUID()
  jobId?: string;

  @ApiProperty({ example: 'Work Visa' })
  @IsString()
  @MinLength(2)
  visaType!: string;

  @ApiProperty({ example: 'Saudi Arabia' })
  @IsString()
  @MinLength(2)
  destinationCountry!: string;

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
