import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested
} from 'class-validator';

import { ApplicantSkillDto } from '../shared/applicant-skill.dto';
import { ApplicantQualificationDto } from '../shared/applicant-qualification.dto';
import { ApplicantWorkExperienceDto } from '../shared/applicant-work-experience.dto';
import { ApplicantDocumentDto } from '../shared/applicant-document.dto';
import { ApplicantEmergencyContactDto } from '../shared/applicant-emergency-contact.dto';

import { Genders } from '../shared/enums.dto';
import type { Gender } from '../shared/enums.dto';
import { JsonArrayOf, ToNumber } from '../shared/transforms';

export class DraftUpsertApplicantDto {
  @ApiProperty({ example: '+251911111111' })
  @IsString()
  @MinLength(6)
  phone!: string;

  @ApiPropertyOptional({ example: 'fetiyeseid@gmail.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Fetiya' })
  @IsString()
  firstName!: string;

  @ApiPropertyOptional({ example: 'Seid' })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({ example: 'Seid' })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: 'FEMALE', enum: Genders })
  @IsIn(Genders)
  gender!: Gender;

  @ApiProperty({ example: '1998-01-15' })
  @IsDateString()
  dateOfBirth!: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  placeOfBirth!: string;

  @ApiProperty({ example: 'Ethiopian' })
  @IsString()
  nationality!: string;

  @ApiPropertyOptional({ example: 'Islam' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiProperty({ example: 'SINGLE' })
  @IsString()
  maritalStatus!: string;

  @ApiProperty({ example: 'Electrician' })
  @IsString()
  occupation!: string;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  numberOfChildren?: number;

  @ApiPropertyOptional({ example: 165 })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 58 })
  @IsOptional()
  @ToNumber()
  @IsNumber()
  weight?: number;

  @ApiProperty({ example: 'EF12345678' })
  @IsString()
  laborId!: string;

  @ApiPropertyOptional({ example: 'Bole, Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'P12345678' })
  @IsString()
  passportNumber!: string;

  @ApiProperty({ example: 'Addis Ababa' })
  @IsString()
  passportPlace!: string;

  @ApiProperty({ example: '2020-01-01' })
  @IsDateString()
  passportIssueDate!: string;

  @ApiProperty({ example: '2030-12-31' })
  @IsDateString()
  passportExpiry!: string;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  personalPhoto?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  passportFile?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  applicantIdFile?: any;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  cocCertificateFile?: any;

  @ApiPropertyOptional({ type: [ApplicantEmergencyContactDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantEmergencyContactDto, { fieldName: 'emergencyContacts' })
  @IsArray()
  @ValidateNested({ each: true })
  emergencyContacts?: ApplicantEmergencyContactDto[];

  @ApiPropertyOptional({ type: [ApplicantSkillDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantSkillDto, { fieldName: 'skills', allowSingleObject: true })
  @IsArray()
  @ValidateNested({ each: true })
  skills?: ApplicantSkillDto[];

  @ApiPropertyOptional({ type: [ApplicantQualificationDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantQualificationDto, { fieldName: 'qualifications' })
  @IsArray()
  @ValidateNested({ each: true })
  qualifications?: ApplicantQualificationDto[];

  @ApiPropertyOptional({ type: [ApplicantWorkExperienceDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantWorkExperienceDto, { fieldName: 'workExperiences' })
  @IsArray()
  @ValidateNested({ each: true })
  workExperiences?: ApplicantWorkExperienceDto[];

  @ApiPropertyOptional({
    type: [ApplicantDocumentDto],
    example: [
      { documentType: 'PASSPORT', fileUrl: '/uploads/applicants/documents/passport.pdf', status: 'PENDING' },
      { documentType: 'PERSONAL_PHOTO', fileUrl: '/uploads/applicants/photos/photo.jpg', status: 'PENDING' },
      { documentType: 'COC_CERTIFICATE', fileUrl: '/uploads/applicants/certificates/coc.pdf', status: 'PENDING' },
      { documentType: 'APPLICANT_ID', fileUrl: '/uploads/applicants/ids/id.pdf', status: 'PENDING' }
    ]
  })
  @IsOptional()
  @JsonArrayOf(ApplicantDocumentDto, { fieldName: 'documents' })
  @IsArray()
  @ValidateNested({ each: true })
  documents?: ApplicantDocumentDto[];
}