import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApplicantsService } from '../services/applicants.service';
import { ApplicantVerificationService } from '../services/applicant-verification.service';
import { RejectApplicantProfileDto } from '../dto/reject-applicant-profile.dto';
import { VerifyApplicantProfileDto } from '../dto/verify-applicant-profile.dto';

@ApiTags('Admin Applicants')
@ApiBearerAuth()
@Controller('api/admin/applicants')
export class AdminApplicantsController {
  constructor(
    private readonly applicants: ApplicantsService,
    private readonly verification: ApplicantVerificationService
  ) {}

  @RequirePermissions('APPLICANT_PROFILE_VIEW')
  @Get()
  @ApiOperation({ summary: 'List applicant profiles (optional filters)' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'SUBMITTED', 'VERIFIED', 'REJECTED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(@Query('status') status?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.applicants.listByStatus(status, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }

  @RequirePermissions('APPLICANT_PROFILE_VIEW')
  @Get(':applicantId')
  @ApiOperation({ summary: 'Get applicant profile details (with items)' })
  get(@Param('applicantId') applicantId: string) {
    return this.applicants.getProfile(applicantId);
  }

  @RequirePermissions('APPLICANT_PROFILE_VERIFY')
  @Patch(':applicantId/verify')
  @ApiOperation({ summary: 'Verify applicant profile (SUBMITTED -> VERIFIED) and create user' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, userId: 'uuid', applicantId: 'uuid' } } })
  verify(
    @Param('applicantId') applicantId: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body() _dto: VerifyApplicantProfileDto
  ) {
    return this.verification.verify(applicantId, user.userId);
  }

  @RequirePermissions('APPLICANT_PROFILE_REJECT')
  @Patch(':applicantId/reject')
  @ApiOperation({ summary: 'Reject applicant profile (SUBMITTED -> REJECTED)' })
  reject(
    @Param('applicantId') applicantId: string,
    @CurrentUserDecorator() user: CurrentUser,
    @Body() dto: RejectApplicantProfileDto
  ) {
    return this.applicants.reject(applicantId, dto.reason, user.userId);
  }
}
