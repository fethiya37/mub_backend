import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AuthService } from '../services/auth.service';
import { CurrentUserDecorator } from '../../../common/decorators/current-user.decorator';
import type { CurrentUser } from '../../../common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) { }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login with phone or email + password' })
  @ApiResponse({
    status: 201,
    description: 'Tokens',
    schema: {
      example: {
        accessToken: 'jwt',
        refreshToken: 'jti.token',
        expiresInSeconds: 900,
        roles: ['ADMIN'],
        permissions: ['USER_MANAGE'],
        applicantVerified: true
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials / locked / deactivated' })
  login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.auth.login(dto, { ip: req.ip, ua: req.headers['user-agent'] as string });
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token (rotates refresh token)' })
  @ApiResponse({
    status: 201,
    description: 'New tokens',
    schema: { example: { accessToken: 'jwt', refreshToken: 'jti.token', expiresInSeconds: 900 } }
  })
  @ApiResponse({ status: 401, description: 'Invalid/expired refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset (returns token for now)' })
  @ApiResponse({ status: 201, description: 'OK', schema: { example: { ok: true, token: 'raw_token' } } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.auth.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 201, description: 'OK', schema: { example: { ok: true } } })
  @ApiResponse({ status: 400, description: 'Invalid/expired/used token' })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.auth.resetPassword(dto);
  }

  @ApiBearerAuth()
  @Post('change-password')
  @ApiOperation({ summary: 'Change password (requires auth)' })
  @ApiResponse({ status: 201, description: 'OK', schema: { example: { ok: true } } })
  @ApiResponse({ status: 401, description: 'Unauthorized/Invalid credentials' })
  changePassword(@CurrentUserDecorator() user: CurrentUser, @Body() dto: ChangePasswordDto) {
    return this.auth.changePassword(user.userId, dto);
  }

  @ApiBearerAuth()
  @Post('logout')
  @ApiOperation({ summary: 'Logout (revoke all refresh tokens)' })
  @ApiResponse({ status: 201, description: 'OK', schema: { example: { ok: true } } })
  logout(@CurrentUserDecorator() user: CurrentUser) {
    return this.auth.logout(user.userId);
  }

  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Get current user claim payload' })
  @ApiResponse({
    status: 200,
    description: 'Current user',
    schema: {
      example: {
        userId: 'uuid',
        email: 'admin@mub.local',
        phone: '+251900000000',
        roles: ['ADMIN'],
        permissions: ['USER_MANAGE'],
        isActive: true,
        applicantVerified: true,
        tokenVersion: 0
      }
    }
  })
  me(@CurrentUserDecorator() user: CurrentUser) {
    return user;
  }
}
