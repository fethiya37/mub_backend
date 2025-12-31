
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EmployerJobsService } from '../services/employer-jobs.service';
import { CreateJobDto } from '../dto/create-job.dto';
import { UpdateJobDto } from '../dto/update-job.dto';

@ApiTags('Employer Jobs')
@ApiBearerAuth()
@Controller('api/employer/jobs')
export class EmployerJobsController {
  constructor(private readonly jobs: EmployerJobsService) {}

  @RequirePermissions('JOB_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create job (APPROVED employer only)' })
  create(@CurrentUserDecorator() user: CurrentUser, @Body() dto: CreateJobDto) {
    return this.jobs.create(user.userId, dto);
  }

  @RequirePermissions('JOB_MANAGE')
  @Put(':id')
  @ApiOperation({ summary: 'Update job (own jobs only)' })
  update(@CurrentUserDecorator() user: CurrentUser, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobs.update(user.userId, id, dto);
  }

  @RequirePermissions('JOB_VIEW')
  @Get()
  @ApiOperation({ summary: 'List own jobs' })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'ACTIVE', 'CLOSED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(
    @CurrentUserDecorator() user: CurrentUser,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    return this.jobs.list(user.userId, status, page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }
}
