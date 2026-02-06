import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ApplicantSkillDto } from '../shared/applicant-skill.dto';
import { ApplicantQualificationDto } from '../shared/applicant-qualification.dto';
import { ApplicantWorkExperienceDto } from '../shared/applicant-work-experience.dto';
import { ApplicantDocumentDto } from '../shared/applicant-document.dto';

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

  @ApiPropertyOptional({
    type: [ApplicantSkillDto],
    example: [{ skillId: 'uuid-skill-id', hasSkill: true, willingToLearn: false }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantSkillDto)
  skills?: ApplicantSkillDto[];

  @ApiPropertyOptional({
    type: [ApplicantQualificationDto],
    example: [{ qualification: 'Safety Training' }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantQualificationDto)
  qualifications?: ApplicantQualificationDto[];

  @ApiPropertyOptional({
    type: [ApplicantWorkExperienceDto],
    example: [{ jobTitle: 'Electrician', country: 'UAE', yearsWorked: 3 }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantWorkExperienceDto)
  workExperiences?: ApplicantWorkExperienceDto[];

  @ApiPropertyOptional({
    type: [ApplicantDocumentDto],
    example: [{ documentType: 'OTHER', fileUrl: '/uploads/applicants/uuid/extra.pdf', status: 'PENDING' }]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApplicantDocumentDto)
  documents?: ApplicantDocumentDto[];
}
