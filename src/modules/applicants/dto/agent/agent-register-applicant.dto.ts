import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';
import { ApplicantSkillDto } from '../shared/applicant-skill.dto';
import { ApplicantQualificationDto } from '../shared/applicant-qualification.dto';
import { ApplicantWorkExperienceDto } from '../shared/applicant-work-experience.dto';
import { ApplicantDocumentDto } from '../shared/applicant-document.dto';
import { Genders } from '../shared/enums.dto';
import type { Gender } from '../shared/enums.dto';

export class AgentRegisterApplicantDto {
  @ApiProperty({ example: '+251911111111' })
  @IsString()
  @MinLength(6)
  phone!: string;

  @ApiPropertyOptional({ example: 'applicant@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Fetiya' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Seid' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'FEMALE', enum: Genders })
  @IsOptional()
  @IsIn(Genders)
  gender?: Gender;

  @ApiPropertyOptional({ example: '1998-01-15' })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiPropertyOptional({ example: 'Ethiopian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ example: 'P12345678' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @ApiPropertyOptional({ example: 'EF12345678' })
  @IsOptional()
  @IsString()
  laborId?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'SINGLE' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ type: [ApplicantSkillDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantSkillDto)
  skills?: ApplicantSkillDto[];

  @ApiPropertyOptional({ type: [ApplicantQualificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantQualificationDto)
  qualifications?: ApplicantQualificationDto[];

  @ApiPropertyOptional({ type: [ApplicantWorkExperienceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantWorkExperienceDto)
  workExperiences?: ApplicantWorkExperienceDto[];

  @ApiPropertyOptional({ type: [ApplicantDocumentDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantDocumentDto)
  documents?: ApplicantDocumentDto[];
}
