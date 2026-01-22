import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { CvAdminReviewService } from '../services/cv-admin-review.service';
import { AdminListCvsQueryDto } from '../dto/admin/admin-list-cvs.query.dto';
import { AdminUpdateCvStatusDto } from '../dto/admin/admin-update-cv-status.dto';

@ApiTags('Admin CVs')
@ApiBearerAuth()
@Controller('api/admin/cvs')
export class AdminCvsController {
  constructor(private readonly review: CvAdminReviewService) {}

  @RequirePermissions('APPLICANT_VIEW')
  @Get()
  @ApiOperation({ summary: 'List CVs (admin/staff)' })
  list(@Query() q: AdminListCvsQueryDto) {
    return this.review.listAdmin(
      { status: q.status, applicantId: q.applicantId, jobId: q.jobId },
      q.page ?? 1,
      q.pageSize ?? 50
    );
  }

  @RequirePermissions('APPLICANT_DOCUMENT_VERIFY')
  @Put(':id/status')
  @ApiOperation({ summary: 'Approve or reject a submitted CV' })
  updateStatus(@Param('id') id: string, @Body() dto: AdminUpdateCvStatusDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.updateStatus(user.userId, id, dto);
  }
}
