import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { PermissionRepository } from '../repositories/permission.repository';

@ApiTags('Admin RBAC')
@ApiBearerAuth()
@Controller('api/admin/permissions')
export class AdminPermissionsController {
  constructor(private readonly permissions: PermissionRepository) {}

  @RequirePermissions('RBAC_MANAGE')
  @Get()
  @ApiOperation({ summary: 'List permissions' })
  @ApiResponse({ status: 200 })
  list() {
    return this.permissions.list();
  }
}
