import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApplicantSkillDto } from '../shared/applicant-skill.dto';
import { ApplicantQualificationDto } from '../shared/applicant-qualification.dto';
import { ApplicantWorkExperienceDto } from '../shared/applicant-work-experience.dto';
import { ApplicantDocumentDto } from '../shared/applicant-document.dto';
import { JsonArrayOf } from '../shared/transforms';

export class UpdateVerifiedApplicantDto {
  @ApiPropertyOptional({ example: 'newemail@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'Dubai, UAE' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'MARRIED' })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({ example: 'Electrician' })
  @IsOptional()
  @IsString()
  occupation?: string;

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

  @ApiPropertyOptional({ type: [ApplicantSkillDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantSkillDto)
  @IsArray()
  @ValidateNested({ each: true })
  skills?: ApplicantSkillDto[];

  @ApiPropertyOptional({ type: [ApplicantQualificationDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantQualificationDto)
  @IsArray()
  @ValidateNested({ each: true })
  qualifications?: ApplicantQualificationDto[];

  @ApiPropertyOptional({ type: [ApplicantWorkExperienceDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantWorkExperienceDto)
  @IsArray()
  @ValidateNested({ each: true })
  workExperiences?: ApplicantWorkExperienceDto[];

  @ApiPropertyOptional({ type: [ApplicantDocumentDto] })
  @IsOptional()
  @JsonArrayOf(ApplicantDocumentDto)
  @IsArray()
  @ValidateNested({ each: true })
  documents?: ApplicantDocumentDto[];
}
