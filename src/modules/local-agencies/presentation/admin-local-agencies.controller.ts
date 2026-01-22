import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AdminListLocalAgenciesQueryDto } from '../dto/admin/admin-list-local-agencies.query.dto';
import { AdminApproveLocalAgencyDto } from '../dto/admin/admin-approve-local-agency.dto';
import { AdminRejectLocalAgencyDto } from '../dto/admin/admin-reject-local-agency.dto';
import { AdminSuspendLocalAgencyDto } from '../dto/admin/admin-suspend-local-agency.dto';
import { AdminReactivateLocalAgencyDto } from '../dto/admin/admin-reactivate-local-agency.dto';
import { AdminCreateLocalAgencyDto } from '../dto/admin/admin-create-local-agency.dto';
import { LocalAgencyReviewService } from '../services/local-agency-review.service';
import { LocalAgenciesService } from '../services/local-agencies.service';

@ApiTags('Admin Local Agencies')
@ApiBearerAuth()
@Controller('api/admin/local-agencies')
export class AdminLocalAgenciesController {
  constructor(
    private readonly review: LocalAgencyReviewService,
    private readonly agencies: LocalAgenciesService
  ) {}

  @RequirePermissions('LOCAL_AGENCY_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Create local agency by MUB staff/admin (creates PENDING record, no user yet)' })
  @ApiResponse({
    status: 201,
    schema: { example: { id: '9f8f3b2d-0b7d-4b7a-a8d0-6c9d3d5e0c11', status: 'PENDING' } }
  })
  create(@Body() dto: AdminCreateLocalAgencyDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.agencies.adminCreate(dto, user.userId);
  }

  @RequirePermissions('LOCAL_AGENCY_VIEW')
  @Get()
  @ApiOperation({ summary: 'List local agencies (paged, optional status)' })
  @ApiQuery({ name: 'status', required: false, enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'] })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  list(@Query() q: AdminListLocalAgenciesQueryDto) {
    return this.review.list(q.status, q.page ? Number(q.page) : 1, q.pageSize ? Number(q.pageSize) : 50);
  }

  @RequirePermissions('LOCAL_AGENCY_VIEW')
  @Get(':id')
  @ApiOperation({ summary: 'Get local agency details + approval logs' })
  get(@Param('id') id: string) {
    return this.review.get(id);
  }

  @RequirePermissions('LOCAL_AGENCY_APPROVE')
  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve local agency (PENDING -> APPROVED) and create LOCAL_AGENCY user' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, agencyId: 'uuid', userId: 'uuid' } } })
  approve(@Param('id') id: string, @Body() dto: AdminApproveLocalAgencyDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.approve(id, user.userId, dto.reason);
  }

  @RequirePermissions('LOCAL_AGENCY_APPROVE')
  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject local agency (PENDING -> REJECTED)' })
  reject(@Param('id') id: string, @Body() dto: AdminRejectLocalAgencyDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.reject(id, user.userId, dto.reason);
  }

  @RequirePermissions('LOCAL_AGENCY_SUSPEND')
  @Patch(':id/suspend')
  @ApiOperation({ summary: 'Suspend local agency (APPROVED -> SUSPENDED) and deactivate user' })
  suspend(@Param('id') id: string, @Body() dto: AdminSuspendLocalAgencyDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.suspend(id, user.userId, dto.reason);
  }

  @RequirePermissions('LOCAL_AGENCY_REACTIVATE')
  @Patch(':id/reactivate')
  @ApiOperation({ summary: 'Reactivate local agency (SUSPENDED -> APPROVED) and reactivate user' })
  reactivate(@Param('id') id: string, @Body() dto: AdminReactivateLocalAgencyDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.review.reactivate(id, user.userId, dto.reason);
  }
}
