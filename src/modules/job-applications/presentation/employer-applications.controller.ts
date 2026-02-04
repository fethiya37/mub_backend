import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

import { JobApplicationsService } from '../services/job-applications.service';
import { EmployerListApplicationsQueryDto } from '../dto/employer/employer-list-applications.query.dto';
import { EmployerDecideApplicationDto } from '../dto/employer/employer-decide-application.dto';

@ApiTags('Employer Applications')
@ApiBearerAuth()
@Controller('api/employer/job-applications')
export class EmployerApplicationsController {
  constructor(private readonly applications: JobApplicationsService) {}

  @RequirePermissions('APPLICATION_VIEW')
  @Get()
  @ApiOperation({ summary: 'List applications for my employer jobs' })
  list(@CurrentUserDecorator() user: CurrentUser, @Query() q: EmployerListApplicationsQueryDto) {
    return this.applications.listEmployerApplications(user.userId, q);
  }

  @RequirePermissions('APPLICATION_MANAGE')
  @Post(':id/decide')
  @ApiOperation({ summary: 'Employer decide (APPROVED -> SELECTED/REJECTED)' })
  decide(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: EmployerDecideApplicationDto) {
    return this.applications.decideAsEmployer(user.userId, id, dto);
  }
}
