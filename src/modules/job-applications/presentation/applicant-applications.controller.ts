import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { JobApplicationsService } from '../services/job-applications.service';
import { ApplyJobDto } from '../dto/applicant/apply-job.dto';
import { UpdateCvDto } from '../dto/applicant/update-cv.dto';
import { WithdrawApplicationDto } from '../dto/applicant/withdraw-application.dto';
import { ListMyApplicationsQueryDto } from '../dto/applicant/list-my-applications.query.dto';

@ApiTags('Applicant Applications')
@ApiBearerAuth()
@Controller('api/applicant/job-applications')
export class ApplicantApplicationsController {
  constructor(private readonly applications: JobApplicationsService) {}

  @RequirePermissions('APPLICATION_CREATE')
  @Post()
  @ApiOperation({ summary: 'Apply (or reapply if REJECTED/WITHDRAWN) to a job' })
  apply(@CurrentUserDecorator() user: CurrentUser, @Body() dto: ApplyJobDto) {
    return this.applications.applyAsApplicant(user.userId, dto);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Put(':id/cv')
  @ApiOperation({ summary: 'Update CV for own application (PENDING only)' })
  updateCv(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateCvDto) {
    return this.applications.updateCvAsApplicant(user.userId, id, dto);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/withdraw')
  @ApiOperation({ summary: 'Withdraw own application (PENDING only)' })
  withdraw(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: WithdrawApplicationDto) {
    return this.applications.withdrawAsApplicant(user.userId, id, dto);
  }

  @RequirePermissions('APPLICATION_VIEW_SELF')
  @Get()
  @ApiOperation({ summary: 'List my applications' })
  listMy(@CurrentUserDecorator() user: CurrentUser, @Query() q: ListMyApplicationsQueryDto) {
    return this.applications.listMyApplications(user.userId, q);
  }
}
