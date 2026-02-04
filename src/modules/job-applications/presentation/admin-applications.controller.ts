import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { JobApplicationsService } from '../services/job-applications.service';
import { AdminCreateApplicationDto } from '../dto/admin/admin-create-application.dto';
import { AdminListApplicationsQueryDto } from '../dto/admin/admin-list-applications.query.dto';
import { AdminApproveApplicationDto } from '../dto/admin/admin-approve-application.dto';
import { AdminRejectApplicationDto } from '../dto/admin/admin-reject-application.dto';
import { AdminUpdateCvDto } from '../dto/admin/admin-update-cv.dto';

@ApiTags('Admin Applications')
@ApiBearerAuth()
@Controller('api/admin/job-applications')
export class AdminApplicationsController {
  constructor(private readonly applications: JobApplicationsService) {}

  @RequirePermissions('APPLICATION_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create (or reapply) on behalf of applicant' })
  create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateApplicationDto) {
    return this.applications.createAsAdmin(user.userId, dto);
  }

  @RequirePermissions('APPLICATION_VIEW')
  @Get()
  @ApiOperation({ summary: 'Admin list applications' })
  list(@Query() q: AdminListApplicationsQueryDto) {
    return this.applications.listAdminApplications(q);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Put(':id/cv')
  @ApiOperation({ summary: 'Update CV on behalf (PENDING only)' })
  updateCv(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminUpdateCvDto) {
    return this.applications.updateCvAsAdmin(user.userId, id, dto);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/approve')
  @ApiOperation({ summary: 'Admin approve (PENDING -> APPROVED)' })
  approve(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminApproveApplicationDto) {
    return this.applications.approveAsAdmin(user.userId, id, dto);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/reject')
  @ApiOperation({ summary: 'Admin reject (PENDING -> REJECTED)' })
  reject(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: AdminRejectApplicationDto) {
    return this.applications.rejectAsAdmin(user.userId, id, dto);
  }
}
