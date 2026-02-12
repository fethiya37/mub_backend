import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { AdminResetApplicantPasswordDto } from '../dto/admin-reset-applicant-password.dto';
import { AuthService } from '../services/auth.service';

@ApiTags('Admin Auth')
@ApiBearerAuth()
@Controller('api/admin/auth')
export class AdminAuthController {
  constructor(private readonly auth: AuthService) {}

  @RequirePermissions('USER_CREATE')
  @Post('users')
  @ApiOperation({ summary: 'Admin creates staff/system user and sends Account Setup email' })
  @ApiResponse({ status: 201, schema: { example: { ok: true, userId: 'uuid' } } })
  adminCreateUser(@CurrentUserDecorator() user: CurrentUser, @Body() dto: AdminCreateUserDto) {
    return this.auth.adminCreateUser(dto, user.userId);
  }

  @RequirePermissions('USER_UPDATE')
  @Post('applicants/:id/reset-password')
  @ApiOperation({ summary: 'Admin resets applicant password (returns temp password)' })
  @ApiResponse({ status: 200, schema: { example: { ok: true, tempPassword: 'TempPass123!' } } })
  resetApplicantPassword(
    @CurrentUserDecorator() user: CurrentUser,
    @Param('id') id: string,
    @Body() dto: AdminResetApplicantPasswordDto
  ) {
    return this.auth.adminResetApplicantPassword(id, dto, user.userId);
  }
}
