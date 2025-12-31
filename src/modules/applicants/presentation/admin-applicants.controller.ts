import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApplicantReviewService } from '../services/applicant-review.service';
import { RejectApplicantDto } from '../dto/admin/reject-applicant.dto';
import { VerifyApplicantDto } from '../dto/admin/verify-applicant.dto';

@ApiTags('Admin Applicants')
@ApiBearerAuth()
@Controller('api/admin/applicants')
export class AdminApplicantsController {
  constructor(private readonly review: ApplicantReviewService) {}

  @RequirePermissions('APPLICANT_PROFILE_VIEW')
  @Get()
  @ApiOperation({ summary: 'List applicants (paged, optional status)' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'REJECTED', 'VERIFIED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(@Query('status') status?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.review.list(status, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }

  @RequirePermissions('APPLICANT_PROFILE_VIEW')
  @Get(':applicantId')
  @ApiOperation({ summary: 'Get applicant details' })
  get(@Param('applicantId') applicantId: string) {
    return this.review.get(applicantId);
  }

  @RequirePermissions('APPLICANT_PROFILE_REJECT')
  @Patch(':applicantId/reject')
  @ApiOperation({ summary: 'Reject applicant (SUBMITTED -> REJECTED) and rotate Draft token' })
  reject(@Param('applicantId') applicantId: string, @Body() dto: RejectApplicantDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.reject(applicantId, user.userId, dto.reason);
  }

  @RequirePermissions('APPLICANT_PROFILE_VERIFY')
  @Patch(':applicantId/verify')
  @ApiOperation({ summary: 'Verify applicant (SUBMITTED -> VERIFIED) and create User' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, applicantId: 'uuid', userId: 'uuid' } } })
  verify(@Param('applicantId') applicantId: string, @Body() _dto: VerifyApplicantDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.verify(applicantId, user.userId);
  }
}
