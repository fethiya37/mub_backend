import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { EmployerJobsService } from '../services/employer-jobs.service';
import { AdminCreateJobForEmployerDto } from '../dto/admin/admin-create-job-for-employer.dto';
import { AdminUpdateJobForEmployerDto } from '../dto/admin/admin-update-job-for-employer.dto';

@ApiTags('Admin Jobs')
@ApiBearerAuth()
@Controller('api/admin/jobs')
export class AdminJobsController {
  constructor(private readonly jobs: EmployerJobsService) {}

  @RequirePermissions('JOB_CREATE')
  @Post()
  @ApiOperation({ summary: 'Create job on behalf of employer (MUB Admin/Staff)' })
  createForEmployer(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateJobForEmployerDto) {
    return this.jobs.adminCreate(user.userId, dto);
  }

  @RequirePermissions('JOB_UPDATE')
  @Put()
  @ApiOperation({ summary: 'Update job on behalf of employer (MUB Admin/Staff)' })
  updateForEmployer(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminUpdateJobForEmployerDto) {
    return this.jobs.adminUpdate(user.userId, dto);
  }
}
