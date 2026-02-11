import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { UsersService } from '../services/users.service';
import { AdminUpdateUserDto } from '../dto/admin/admin-update-user.dto';
import { AdminUpdateUserStatusDto } from '../dto/admin/admin-update-user-status.dto';

@ApiTags('Admin Users')
@ApiBearerAuth()
@Controller('api/admin/users')
export class AdminUsersController {
  constructor(private readonly users: UsersService) {}

  @RequirePermissions('USER_READ')
  @Get()
  @ApiOperation({ summary: 'List users (paged)' })
  @ApiResponse({ status: 200 })
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.users.list(page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }

  @RequirePermissions('USER_READ')
  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiResponse({ status: 200 })
  get(@Param('id') id: string) {
    return this.users.get(id);
  }

  @RequirePermissions('USER_UPDATE')
  @Patch(':id')
  @ApiOperation({ summary: 'Update user (admin)' })
  @ApiResponse({ status: 200 })
  update(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
    return this.users.update(id, {
      email: 'email' in dto ? (dto.email ?? null) : undefined,
      phone: dto.phone,
      fullName: 'fullName' in dto ? (dto.fullName ?? null) : undefined,
      status: dto.status,
      isActive: dto.isActive,
      applicantVerified: dto.applicantVerified
    });
  }

  @RequirePermissions('USER_APPROVE')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update user status (admin)' })
  @ApiResponse({ status: 200 })
  updateStatus(@Param('id') id: string, @Body() dto: AdminUpdateUserStatusDto) {
    return this.users.updateStatus(id, dto.status);
  }

  @RequirePermissions('USER_REACTIVATE')
  @Patch(':id/activate')
  @ApiOperation({ summary: 'Activate user (bumps tokenVersion)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  activate(@Param('id') id: string) {
    return this.users.setActive(id, true);
  }

  @RequirePermissions('USER_SUSPEND')
  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user (bumps tokenVersion)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  deactivate(@Param('id') id: string) {
    return this.users.setActive(id, false);
  }
}
