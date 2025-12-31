import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { EmployersService } from '../services/employers.service';
import { EmployerApprovalService } from '../services/employer-approval.service';
import { AdminCreateEmployerDto } from '../dto/admin/admin-create-employer.dto';
import { EmployerApproveDto } from '../dto/employer-approve.dto';
import { EmployerRejectDto } from '../dto/employer-reject.dto';
import { AdminListEmployersQueryDto } from '../dto/admin/admin-list-employers.query.dto';

@ApiTags('Admin Employers')
@ApiBearerAuth()
@Controller('api/admin/employers')
export class AdminEmployersController {
  constructor(
    private readonly employers: EmployersService,
    private readonly approval: EmployerApprovalService
  ) {}

  @RequirePermissions('EMPLOYER_VIEW')
  @Get()
  @ApiOperation({ summary: 'List employers' })
  list(@Query() q: AdminListEmployersQueryDto) {
    return this.employers.list({ status: q.status, country: q.country }, q.page ?? 1, q.pageSize ?? 50);
  }

  @RequirePermissions('EMPLOYER_VIEW')
  @Get(':id')
  @ApiOperation({ summary: 'Get employer details + approval history' })
  get(@Param('id') id: string) {
    return this.employers.get(id);
  }

  @RequirePermissions('EMPLOYER_MANAGE')
  @Post()
  @ApiOperation({ summary: 'Admin creates employer' })
  async create(@Body() dto: AdminCreateEmployerDto, @CurrentUserDecorator() user: CurrentUser) {
    const employer = await this.employers.adminCreate(dto, user.userId);
    if (dto.autoApprove) return this.approval.approve(employer.id, user.userId, 'Auto approved by admin');
    return employer;
  }

  @RequirePermissions('EMPLOYER_APPROVE')
  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve employer and send account setup email' })
  approve(@Param('id') id: string, @Body() dto: EmployerApproveDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.approval.approve(id, user.userId, dto.reason);
  }

  @RequirePermissions('EMPLOYER_APPROVE')
  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject employer' })
  reject(@Param('id') id: string, @Body() dto: EmployerRejectDto, @CurrentUserDecorator() user: CurrentUser) {
    return this.approval.reject(id, user.userId, dto.reason);
  }
}
