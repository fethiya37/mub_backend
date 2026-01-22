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

  @RequirePermissions('APPLICANT_VIEW')
  @Get()
  @ApiOperation({ summary: 'List applicants (paged, optional status, optional createdBy)' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'REJECTED', 'VERIFIED'] })
  @ApiQuery({ name: 'createdBy', required: false, example: 'uuid-agency-user-id' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(
    @Query('status') status?: string,
    @Query('createdBy') createdBy?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.review.list(status, createdBy, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }

  @RequirePermissions('APPLICANT_VIEW')
  @Get(':applicantId')
  @ApiOperation({ summary: 'Get applicant details' })
  get(@Param('applicantId') applicantId: string) {
    return this.review.get(applicantId);
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Patch(':applicantId/reject')
  @ApiOperation({ summary: 'Reject applicant (SUBMITTED -> REJECTED)' })
  reject(@Param('applicantId') applicantId: string, @Body() dto: RejectApplicantDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.reject(applicantId, user.userId, dto.reason);
  }

  @RequirePermissions('APPLICANT_UPDATE')
  @Patch(':applicantId/verify')
  @ApiOperation({ summary: 'Verify applicant (SUBMITTED -> VERIFIED) and create User' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, applicantId: 'uuid', userId: 'uuid' } } })
  verify(@Param('applicantId') applicantId: string, @Body() _dto: VerifyApplicantDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.verify(applicantId, user.userId);
  }
}
