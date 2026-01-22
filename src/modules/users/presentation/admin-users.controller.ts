import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { UsersService } from '../services/users.service';

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
