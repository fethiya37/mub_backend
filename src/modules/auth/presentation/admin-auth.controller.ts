import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Admin Auth')
@ApiBearerAuth()
@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AuthService) {}

  @RequirePermissions('USER_MANAGE')
  @Post('users')
  @ApiOperation({ summary: 'Admin creates Agent/Partner/Applicant (default password = phone)' })
  @ApiResponse({ status: 201, description: 'Created', schema: { example: { userId: 'uuid' } } })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  adminCreateUser(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateUserDto) {
    return this.auth.adminCreateUser(dto, user.userId);
  }
}
