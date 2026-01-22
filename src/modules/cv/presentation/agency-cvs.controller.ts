import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CvAdminReviewService } from '../services/cv-admin-review.service';
import { CvDraftService } from '../services/cv-draft.service';
import { CvGenerationService } from '../services/cv-generation.service';
import { CvScopeService } from '../services/cv-scope.service';
import { AgencyListCvsQueryDto } from '../dto/agency/agency-list-cvs.query.dto';
import { AgencyCreateCvDraftDto } from '../dto/agency/agency-create-cv-draft.dto';
import { AgencyUpdateCvDraftDto } from '../dto/agency/agency-update-cv-draft.dto';
import { AgencyGenerateCvDto } from '../dto/agency/agency-generate-cv.dto';

@ApiTags('Agency CVs')
@ApiBearerAuth()
@Controller('api/agency/cvs')
export class AgencyCvsController {
  constructor(
    private readonly scope: CvScopeService,
    private readonly review: CvAdminReviewService,
    private readonly drafts: CvDraftService,
    private readonly gen: CvGenerationService
  ) {}

  @RequirePermissions('APPLICANT_VIEW')
  @Get()
  @ApiOperation({ summary: 'List CVs for agency (only their applicants)' })
  list(@CurrentUserDecorator() user: CurrentUser, @Query() q: AgencyListCvsQueryDto) {
    return this.review.listAgency(
      { status: q.status, applicantId: q.applicantId, jobId: q.jobId, createdBy: user.userId },
      q.page ?? 1,
      q.pageSize ?? 50
    );
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Post('draft')
  @ApiOperation({ summary: 'Create CV draft for an agency-owned applicant' })
  async createDraft(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AgencyCreateCvDraftDto) {
    await this.scope.assertApplicantBelongsToAgency(dto.applicantId, user.userId);
    return this.drafts.createDraft({ applicantId: dto.applicantId, performedBy: user.userId, jobId: dto.jobId, summary: dto.summary });
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Put('draft/:cvId')
  @ApiOperation({ summary: 'Update CV draft for agency-owned applicant' })
  async updateDraft(@CurrentUserDecorator() user: CurrentUser, @Param('cvId') cvId: string, @Body() dto: AgencyUpdateCvDraftDto) {
    const cv = await this.review.getCv(cvId);
    await this.scope.assertApplicantBelongsToAgency(cv.applicantId, user.userId);
    return this.drafts.updateDraft({ applicantId: cv.applicantId, performedBy: user.userId, cvId, summary: dto.summary, sections: dto.sections });
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Post('submit/:cvId')
  @ApiOperation({ summary: 'Submit CV (draft -> submitted) for agency-owned applicant' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, cvId: 'cv-uuid-123' } } })
  async submit(@CurrentUserDecorator() user: CurrentUser, @Param('cvId') cvId: string) {
    const cv = await this.review.getCv(cvId);
    await this.scope.assertApplicantBelongsToAgency(cv.applicantId, user.userId);
    return this.drafts.submit({ applicantId: cv.applicantId, performedBy: user.userId, cvId });
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Post('generate')
  @ApiOperation({ summary: 'Generate CV PDF for agency-owned applicant' })
  async generate(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AgencyGenerateCvDto) {
    if (dto.cvId) {
      const cv = await this.review.getCv(dto.cvId);
      await this.scope.assertApplicantBelongsToAgency(cv.applicantId, user.userId);
      return this.gen.generate({ applicantId: cv.applicantId, performedBy: user.userId, cvId: dto.cvId });
    }
    if (!dto.jobId) return { ok: false, message: 'cvId or jobId required' };
    return { ok: false, message: 'Provide cvId for agency generation' };
  }
}
