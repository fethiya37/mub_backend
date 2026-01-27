import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CvAccessService } from '../services/cv-access.service';
import { CvDraftService } from '../services/cv-draft.service';
import { CvGenerationService } from '../services/cv-generation.service';
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
    private readonly gen: CvGenerationService
  ) {}

  @RequirePermissions('APPLICANT_SELF_VIEW')
  @Get()
  @ApiOperation({ summary: 'List my CVs (paged, optional filters)' })
  @ApiQuery({ name: 'status', required: false, example: 'draft' })
  @ApiQuery({ name: 'jobId', required: false, format: 'uuid' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  async list(
    @CurrentUserDecorator() user: CurrentUser,
    @Query('status') status?: string,
    @Query('jobId') jobId?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.access.listApplicantCvs(
      { applicantId, status: status ?? undefined, jobId: jobId ?? undefined },
      page ? Number(page) : 1,
      pageSize ? Number(pageSize) : 50
    );
  }

  @RequirePermissions('APPLICANT_SELF_UPDATE')
  @Post('draft')
  @ApiOperation({ summary: 'Create CV draft (current applicant)' })
  async createDraft(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateCvDraftDto) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.drafts.createDraft({ applicantId, performedBy: user.userId, jobId: dto.jobId, summary: dto.summary });
  }

  @RequirePermissions('APPLICANT_SELF_VIEW')
  @Get('draft/:id')
  @ApiOperation({ summary: 'Get CV draft (owned by applicant)' })
  async getDraft(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    await this.access.assertCvOwnedByUser(user.userId, id);
    return this.access.getCv(id);
  }

  @RequirePermissions('APPLICANT_SELF_UPDATE')
  @Put('draft/:id')
  @ApiOperation({ summary: 'Update CV draft' })
  async updateDraft(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateCvDraftDto) {
    await this.access.assertCvOwnedByUser(user.userId, id);
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.drafts.updateDraft({
      applicantId,
      performedBy: user.userId,
      cvId: id,
      summary: dto.summary,
      sections: dto.sections
    });
  }

  @RequirePermissions('APPLICANT_SELF_UPDATE')
  @Post('submit/:id')
  @ApiOperation({ summary: 'Submit CV for admin review (draft -> submitted)' })
  async submit(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string) {
    await this.access.assertCvOwnedByUser(user.userId, id);
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.drafts.submit({ applicantId, performedBy: user.userId, cvId: id });
  }

  @RequirePermissions('APPLICANT_SELF_UPDATE')
  @Post('generate')
  @ApiOperation({ summary: 'Generate PDF version for a CV' })
  async generate(@CurrentUserDecorator() user: CurrentUser, @Body() dto: GenerateCvDto) {
    const applicantId = await this.access.getApplicantIdForUser(user.userId);
    return this.gen.generate({ applicantId, performedBy: user.userId, cvId: dto.cvId, jobId: dto.jobId });
  }
}
