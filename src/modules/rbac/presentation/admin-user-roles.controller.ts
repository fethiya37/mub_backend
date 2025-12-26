import { Body, Controller, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { RbacService } from '../services/rbac.service';
import { UsersService } from '../../users/services/users.service';

export class ReplaceUserRolesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles!: string[];
}

@ApiTags('Admin RBAC')
@ApiBearerAuth()
@Controller('api/admin/users/:userId/roles')
export class AdminUserRolesController {
  constructor(private readonly rbac: RbacService, private readonly users: UsersService) {}

  @RequirePermissions('RBAC_MANAGE')
  @Put()
  @ApiOperation({ summary: 'Replace user roles (bumps tokenVersion)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true } } })
  async replace(@Param('userId') userId: string, @Body() dto: ReplaceUserRolesDto) {
    await this.rbac.replaceUserRoles(userId, dto.roles);
    await this.users.bumpTokenVersion(userId);
    return { ok: true };
  }
}
