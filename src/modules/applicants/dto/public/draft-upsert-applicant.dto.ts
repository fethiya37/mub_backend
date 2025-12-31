import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEmail, IsIn, IsOptional, IsString, MinLength, ValidateNested, IsArray } from 'class-validator';
import { ApplicantSkillDto } from '../shared/applicant-skill.dto';
import { ApplicantQualificationDto } from '../shared/applicant-qualification.dto';
import { ApplicantWorkExperienceDto } from '../shared/applicant-work-experience.dto';
import { ApplicantDocumentDto } from '../shared/applicant-document.dto';
import { Genders } from '../shared/enums.dto';
import type { Gender } from '../shared/enums.dto';

export class DraftUpsertApplicantDto {
  @ApiProperty({ example: '+251911111111' })
  @IsString()
  @MinLength(6)
  phone!: string;

  @ApiPropertyOptional({ example: 'fetiyeseid@gmail.com' })
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

  @ApiPropertyOptional({ example: 'VISA-1234567' })
  @IsOptional()
  @IsString()
  visaNumber?: string;

  @ApiPropertyOptional({ example: 'MOFA-9876543' })
  @IsOptional()
  @IsString()
  applicationNumber?: string;

  @ApiPropertyOptional({ example: 'VISA-1234567|MOFA-9876543' })
  @IsOptional()
  @IsString()
  barcodeValue?: string;

  @ApiPropertyOptional({ type: [ApplicantSkillDto], example: [{ skillName: 'Cooking', proficiencyLevel: 'INTERMEDIATE', yearsOfExperience: 3 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantSkillDto)
  skills?: ApplicantSkillDto[];

  @ApiPropertyOptional({ type: [ApplicantQualificationDto], example: [{ qualificationType: 'COC Level III', institution: 'TVET', country: 'Ethiopia', yearCompleted: 2022 }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantQualificationDto)
  qualifications?: ApplicantQualificationDto[];

  @ApiPropertyOptional({ type: [ApplicantWorkExperienceDto], example: [{ jobTitle: 'Housekeeper', employerName: 'Private', country: 'Saudi Arabia', startDate: '2021-01-01', endDate: '2023-01-01' }] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantWorkExperienceDto)
  workExperiences?: ApplicantWorkExperienceDto[];

  @ApiPropertyOptional({
    type: [ApplicantDocumentDto],
    example: [
      { documentType: 'PASSPORT', fileUrl: 'https://files.example.com/passport.pdf' },
      { documentType: 'PERSONAL_PHOTO', fileUrl: 'https://files.example.com/photo.jpg' },
      { documentType: 'COC_CERTIFICATE', fileUrl: 'https://files.example.com/coc.pdf' },
      { documentType: 'LABOR_ID', fileUrl: 'https://files.example.com/labor-id.pdf' }
    ]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantDocumentDto)
  documents?: ApplicantDocumentDto[];
}
