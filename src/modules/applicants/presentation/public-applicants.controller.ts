import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { ApplicantsService } from '../services/applicants.service';
import { CreateApplicantProfileDto } from '../dto/create-applicant-profile.dto';
import { UpdateApplicantProfileDto } from '../dto/update-applicant-profile.dto';
import { SubmitApplicantProfileDto } from '../dto/submit-applicant-profile.dto';
import { AddSkillDto } from '../dto/add-skill.dto';
import { UpdateSkillDto } from '../dto/update-skill.dto';
import { AddQualificationDto } from '../dto/add-qualification.dto';
import { UpdateQualificationDto } from '../dto/update-qualification.dto';
import { AddWorkExperienceDto } from '../dto/add-work-experience.dto';
import { UpdateWorkExperienceDto } from '../dto/update-work-experience.dto';
import { AddDocumentDto } from '../dto/add-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';

@ApiTags('Public Applicants')
@Public()
@Controller('api/public/applicants')
export class PublicApplicantsController {
  constructor(private readonly applicants: ApplicantsService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Create applicant profile (DRAFT) without user' })
  @ApiResponse({ status: 201 })
  create(@Body() dto: CreateApplicantProfileDto) {
    return this.applicants.createProfile(dto, null);
  }

  @Get('profile/:applicantId')
  @ApiOperation({ summary: 'Get applicant profile with items' })
  get(@Param('applicantId') applicantId: string) {
    return this.applicants.getProfile(applicantId);
  }

  @Put('profile/:applicantId')
  @ApiOperation({ summary: 'Update applicant profile (only DRAFT/REJECTED)' })
  update(@Param('applicantId') applicantId: string, @Body() dto: UpdateApplicantProfileDto) {
    return this.applicants.updateProfile(applicantId, dto, null);
  }

  @Patch('profile/:applicantId/status')
  @ApiOperation({ summary: 'Submit applicant profile (DRAFT/REJECTED -> SUBMITTED)' })
  submit(@Param('applicantId') applicantId: string, @Body() _dto: SubmitApplicantProfileDto) {
    return this.applicants.submit(applicantId, null);
  }

  @Post(':applicantId/skills')
  @ApiOperation({ summary: 'Add skill' })
  addSkill(@Param('applicantId') applicantId: string, @Body() dto: AddSkillDto) {
    return this.applicants.addSkill(applicantId, dto);
  }

  @Put('skills/:skillId')
  @ApiOperation({ summary: 'Update skill' })
  updateSkill(@Param('skillId') skillId: string, @Body() dto: UpdateSkillDto) {
    return this.applicants.updateSkill(skillId, dto);
  }

  @Delete('skills/:skillId')
  @ApiOperation({ summary: 'Delete skill' })
  removeSkill(@Param('skillId') skillId: string) {
    return this.applicants.removeSkill(skillId);
  }

  @Post(':applicantId/qualifications')
  @ApiOperation({ summary: 'Add qualification' })
  addQualification(@Param('applicantId') applicantId: string, @Body() dto: AddQualificationDto) {
    return this.applicants.addQualification(applicantId, dto);
  }

  @Put('qualifications/:id')
  @ApiOperation({ summary: 'Update qualification' })
  updateQualification(@Param('id') id: string, @Body() dto: UpdateQualificationDto) {
    return this.applicants.updateQualification(id, dto);
  }

  @Delete('qualifications/:id')
  @ApiOperation({ summary: 'Delete qualification' })
  removeQualification(@Param('id') id: string) {
    return this.applicants.removeQualification(id);
  }

  @Post(':applicantId/experience')
  @ApiOperation({ summary: 'Add work experience' })
  addWorkExperience(@Param('applicantId') applicantId: string, @Body() dto: AddWorkExperienceDto) {
    return this.applicants.addWorkExperience(applicantId, dto);
  }

  @Put('experience/:id')
  @ApiOperation({ summary: 'Update work experience' })
  updateWorkExperience(@Param('id') id: string, @Body() dto: UpdateWorkExperienceDto) {
    return this.applicants.updateWorkExperience(id, dto);
  }

  @Delete('experience/:id')
  @ApiOperation({ summary: 'Delete work experience' })
  removeWorkExperience(@Param('id') id: string) {
    return this.applicants.removeWorkExperience(id);
  }

  @Post(':applicantId/documents')
  @ApiOperation({ summary: 'Add document' })
  addDocument(@Param('applicantId') applicantId: string, @Body() dto: AddDocumentDto) {
    return this.applicants.addDocument(applicantId, dto);
  }

  @Put('documents/:id')
  @ApiOperation({ summary: 'Update document' })
  updateDocument(@Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.applicants.updateDocument(id, dto);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete document' })
  removeDocument(@Param('id') id: string) {
    return this.applicants.removeDocument(id);
  }
}
