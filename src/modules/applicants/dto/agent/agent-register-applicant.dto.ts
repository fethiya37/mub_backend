import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApplicantSkillDto } from '../shared/applicant-skill.dto';
import { ApplicantQualificationDto } from '../shared/applicant-qualification.dto';
import { ApplicantWorkExperienceDto } from '../shared/applicant-work-experience.dto';
import { ApplicantDocumentDto } from '../shared/applicant-document.dto';
import { ApplicantEmergencyContactDto } from '../shared/applicant-emergency-contact.dto';
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
  middleName?: string;

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

  @ApiPropertyOptional({ example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @ApiPropertyOptional({ example: 'Ethiopian' })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional({ example: 'Islam' })
  @IsOptional()
  @IsString()
  religion?: string;

  @ApiPropertyOptional({ example: 'SINGLE' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 'Electrician' })
  @IsOptional()
  @IsString()
  occupation?: string;


  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsNumber()
  numberOfChildren?: number;

  @ApiPropertyOptional({ example: 170 })
  @IsOptional()
  @IsNumber()
  height?: number;

  @ApiPropertyOptional({ example: 60 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ example: 'EF12345678' })
  @IsOptional()
  @IsString()
  laborId?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa, Ethiopia' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'P12345678' })
  @IsOptional()
  @IsString()
  passportNumber?: string;

  @ApiPropertyOptional({ example: 'Addis Ababa' })
  @IsOptional()
  @IsString()
  passportPlace?: string;

  @ApiPropertyOptional({ example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  passportIssueDate?: string;

  @ApiPropertyOptional({ example: '2030-12-31' })
  @IsOptional()
  @IsDateString()
  passportExpiry?: string;

  @ApiPropertyOptional({
    type: [ApplicantEmergencyContactDto],
    example: [
      {
        fullName: 'Ahmed Seid',
        phone: '+251922222222',
        relationship: 'Brother',
        address: 'Addis Ababa, Ethiopia',
        idFileUrl: 'https://files.example.com/emergency-contact-id.pdf'
      },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantEmergencyContactDto)
  emergencyContacts?: ApplicantEmergencyContactDto[];

  @ApiPropertyOptional({
    type: [ApplicantSkillDto],
    example: [{ skillId: 'uuid-skill-id', hasSkill: true, willingToLearn: false }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantSkillDto)
  skills?: ApplicantSkillDto[];

  @ApiPropertyOptional({
    type: [ApplicantQualificationDto],
    example: [{ qualification: 'COC Level III' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantQualificationDto)
  qualifications?: ApplicantQualificationDto[];

  @ApiPropertyOptional({
    type: [ApplicantWorkExperienceDto],
    example: [{ jobTitle: 'Electrician', country: 'UAE', yearsWorked: 3 }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantWorkExperienceDto)
  workExperiences?: ApplicantWorkExperienceDto[];

  @ApiPropertyOptional({
    type: [ApplicantDocumentDto],
    example: [{ documentType: 'PASSPORT', fileUrl: 'https://files.example.com/applicants/uuid/passport.pdf', status: 'PENDING' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantDocumentDto)
  documents?: ApplicantDocumentDto[];
}
