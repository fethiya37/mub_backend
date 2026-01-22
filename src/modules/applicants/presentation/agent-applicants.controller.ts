import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { DraftUpsertApplicantDto } from '../dto/public/draft-upsert-applicant.dto';
import { ApplicantsService } from '../services/applicants.service';

@ApiTags('Local Agency Applicants')
@ApiBearerAuth()
@Controller('api/local-agency/applicants')
export class AgentApplicantsController {
  constructor(private readonly applicants: ApplicantsService) {}

  @RequirePermissions('APPLICANT_CREATE')
  @Put()
  @ApiOperation({ summary: 'Create/update applicant draft by Local Agency' })
  upsert(@CurrentUserDecorator() user: CurrentUser, @Body() dto: DraftUpsertApplicantDto) {
    return this.applicants.agentDraftUpsert(user.userId, dto);
  }

  @RequirePermissions('APPLICANT_VIEW')
  @Get()
  @ApiOperation({ summary: 'List applicants created by this Local Agency' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'REJECTED', 'VERIFIED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(
    @CurrentUserDecorator() user: CurrentUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.applicants.agentList(user.userId, status, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Post(':applicantId/submit')
  @ApiOperation({ summary: 'Submit applicant created by this Local Agency (DRAFT/REJECTED → SUBMITTED)' })
  submit(@CurrentUserDecorator() user: CurrentUser, @Param('applicantId') applicantId: string) {
    return this.applicants.agentSubmit(user.userId, applicantId);
  }
}
