import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { RbacService } from '../services/rbac.service';

@ApiTags('Admin RBAC')
@ApiBearerAuth()
@Controller('api/admin/roles')
export class AdminRolesController {
  constructor(private readonly rbac: RbacService) {}

  @RequirePermissions('RBAC_MANAGE')
  @Get()
  @ApiOperation({ summary: 'List roles' })
  @ApiResponse({ status: 200 })
  list() {
    return this.rbac.listRoles();
  }
}
