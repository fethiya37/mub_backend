import { Body, Controller, Get, Param, Post, Put, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CvAccessService } from '../services/cv-access.service';
import { CvDraftService } from '../services/cv-draft.service';
import { CvGenerationService } from '../services/cv-generation.service';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';
import { ApplicantCvVersionRepository } from '../repositories/applicant-cv-version.repository';
import { FileStorageService } from '../storage/file-storage.service';
import { CreateCvDraftDto } from '../dto/applicant/create-cv-draft.dto';
import { UpdateCvDraftDto } from '../dto/applicant/update-cv-draft.dto';
import { GenerateCvDto } from '../dto/applicant/generate-cv.dto';

@ApiTags('Applicant CV')
@ApiBearerAuth()
@Controller('api/cv')
export class ApplicantCvController {
  constructor(
    private readonly access: CvAccessService,
    private readonly drafts: CvDraftService,
    private readonly gen: CvGenerationService,
    private readonly cvs: ApplicantCvRepository,
    private readonly versions: ApplicantCvVersionRepository,
    private readonly storage: FileStorageService
  ) {}

  @Post('draft')
  @ApiOperation({ summary: 'Create a CV draft from applicant profile' })
  async createDraft(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateCvDraftDto) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.drafts.createDraft(applicantId, user.userId, dto);
  }

  @Get('draft/:id')
  @ApiOperation({ summary: 'Get CV draft (owned by applicant)' })
  async getDraft(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    const { cv } = await this.access.getCvOwnedByUser(user.userId, id);
    return cv;
  }

  @Put('draft/:id')
  @ApiOperation({ summary: 'Update CV draft (sections, summary)' })
  async updateDraft(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateCvDraftDto) {
    const { applicantId } = await this.access.getCvOwnedByUser(user.userId, id);
    return this.drafts.updateDraft(applicantId, user.userId, id, dto);
  }

  @Post('submit/:id')
  @ApiOperation({ summary: 'Submit CV for admin review (draft -> submitted)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, cvId: 'uuid' } } })
  async submit(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    const { applicantId } = await this.access.getCvOwnedByUser(user.userId, id);
    return this.drafts.submit(applicantId, user.userId, id);
  }

  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF and create a version for a CV (HTML->PDF, template-driven)' })
  async generate(@CurrentUserDecorator() user: CurrentUser, @Body() dto: GenerateCvDto) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.gen.generate(applicantId, user.userId, { cvId: dto.cvId, jobId: dto.jobId });
  }

  @Get('by-job/:jobId')
  @ApiOperation({ summary: 'Get latest CV by job for current applicant (if any)' })
  async byJob(@CurrentUserDecorator() user: CurrentUser, @Param('jobId') jobId: string) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.cvs.findByApplicantAndJob(applicantId, jobId);
  }

  @Get('history')
  @ApiOperation({ summary: 'List all CV versions for current applicant' })
  async history(@CurrentUserDecorator() user: CurrentUser) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.versions.listByApplicant(applicantId);
  }

  @Get('download/:versionId')
  @ApiOperation({ summary: 'Download CV PDF by versionId (owned by applicant)' })
  async download(@CurrentUserDecorator() user: CurrentUser, @Param('versionId') versionId: string, @Res() res: Response) {
    const row = await this.versions.findById(versionId);
    if (!row) return res.status(404).json({ message: 'Not found' });

    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    if (row.cv.applicantId !== applicantId) return res.status(403).json({ message: 'Forbidden' });

    const file = await this.storage.readPdf(row.pdfUrl);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="cv-v${row.versionNumber}.pdf"`);
    return res.send(file.data);
  }
}
