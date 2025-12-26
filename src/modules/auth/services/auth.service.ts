import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { UserRepository } from '../../users/repositories/user.repository';
import { PermissionEvaluatorService } from '../../rbac/services/permission-evaluator.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { LoginPolicyService } from './login-policy.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly evaluator: PermissionEvaluatorService,
    private readonly tokens: TokenService,
    private readonly passwords: PasswordService,
    private readonly loginPolicy: LoginPolicyService,
    private readonly refreshRepo: RefreshTokenRepository,
    private readonly resetRepo: PasswordResetTokenRepository,
    private readonly audit: AuditService
  ) {}

  async login(dto: LoginDto, ctx?: { ip?: string | null; ua?: string | null }) {
    const user = await this.users.findByIdentifier(dto.identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('User is deactivated');

    this.loginPolicy.ensureNotLocked(user);

    const ok = await this.passwords.compare(dto.password, user.passwordHash);
    if (!ok) {
      await this.loginPolicy.onFailedLogin(user);
      await this.audit.log({ performedBy: user.id, action: 'AUTH_LOGIN_FAILED', ipAddress: ctx?.ip ?? null, userAgent: ctx?.ua ?? null });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.loginPolicy.onSuccessfulLogin(user.id);

    const { roles, permissions } = await this.evaluator.getUserRolesAndPermissions(user.id);
    const { accessToken, expiresInSeconds } = this.tokens.signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion });

    const { token: refreshToken, jti } = this.tokens.generateRefreshToken();
    const tokenHash = this.tokens.hashToken(refreshToken);
    const expiresDays = process.env.REFRESH_TOKEN_EXPIRES_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) : 30;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);
    await this.refreshRepo.create({ userId: user.id, tokenHash, jti, expiresAt });

    await this.audit.log({ performedBy: user.id, action: 'AUTH_LOGIN_SUCCESS', ipAddress: ctx?.ip ?? null, userAgent: ctx?.ua ?? null });

    return {
      accessToken,
      refreshToken: `${jti}.${refreshToken}`,
      expiresInSeconds,
      roles,
      permissions,
      applicantVerified: user.applicantVerified
    };
  }

  async refresh(dto: RefreshDto) {
    const parts = dto.refreshToken.split('.');
    if (parts.length !== 2) throw new UnauthorizedException('Invalid refresh token');

    const [jti, token] = parts;
    const row = await this.refreshRepo.findActiveByJti(jti);
    if (!row) throw new UnauthorizedException('Invalid refresh token');
    if (row.revokedAt) throw new UnauthorizedException('Invalid refresh token');
    if (row.expiresAt.getTime() <= Date.now()) throw new UnauthorizedException('Refresh token expired');

    const hash = this.tokens.hashToken(token);
    if (hash !== row.tokenHash) throw new UnauthorizedException('Invalid refresh token');

    await this.refreshRepo.revoke(row.id);

    const user = await this.users.findById(row.userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Invalid refresh token');

    const { roles, permissions } = await this.evaluator.getUserRolesAndPermissions(user.id);
    const { accessToken, expiresInSeconds } = this.tokens.signAccessToken({ userId: user.id, tokenVersion: user.tokenVersion });

    const { token: newRefresh, jti: newJti } = this.tokens.generateRefreshToken();
    const tokenHash = this.tokens.hashToken(newRefresh);
    const expiresDays = process.env.REFRESH_TOKEN_EXPIRES_DAYS ? Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) : 30;
    const expiresAt = new Date(Date.now() + expiresDays * 24 * 60 * 60 * 1000);
    await this.refreshRepo.create({ userId: user.id, tokenHash, jti: newJti, expiresAt });

    return {
      accessToken,
      refreshToken: `${newJti}.${newRefresh}`,
      expiresInSeconds,
      roles,
      permissions,
      applicantVerified: user.applicantVerified
    };
  }

  async logout(userId: string) {
    await this.refreshRepo.revokeAllForUser(userId);
    await this.audit.log({ performedBy: userId, action: 'AUTH_LOGOUT' });
    return { ok: true };
  }

  async adminCreateUser(dto: AdminCreateUserDto, performedBy: string) {
    const existsPhone = await this.users.findByIdentifier(dto.phone);
    if (existsPhone) throw new ConflictException('Phone already exists');
    if (dto.email) {
      const existsEmail = await this.users.findByIdentifier(dto.email);
      if (existsEmail) throw new ConflictException('Email already exists');
    }

    const defaultPwd = dto.defaultPasswordIsPhone !== false ? dto.phone : null;
    if (!defaultPwd) throw new BadRequestException('defaultPasswordIsPhone must be true for admin create in this setup');

    const passwordHash = await this.passwords.hash(defaultPwd);

    const user = await this.users.create({
      phone: dto.phone,
      email: dto.email ?? null,
      passwordHash,
      isActive: true,
      applicantVerified: dto.role === 'APPLICANT' ? false : true
    });

    await this.audit.log({
      performedBy,
      action: 'ADMIN_CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      meta: { role: dto.role }
    });

    return { userId: user.id };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.users.findByIdentifier(dto.identifier);
    if (!user) return { ok: true };

    const raw = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const mins = process.env.PASSWORD_RESET_EXPIRES_MINUTES ? Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) : 20;
    const expiresAt = new Date(Date.now() + mins * 60 * 1000);

    await this.resetRepo.invalidateAllForUser(user.id);
    await this.resetRepo.create({ userId: user.id, tokenHash, expiresAt });

    await this.audit.log({ performedBy: user.id, action: 'AUTH_PASSWORD_RESET_REQUEST' });

    return { ok: true, token: raw };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = crypto.createHash('sha256').update(dto.token).digest('hex');
    const row = await this.resetRepo.findValidByTokenHash(tokenHash);
    if (!row) throw new BadRequestException('Invalid token');
    if (row.usedAt) throw new BadRequestException('Token already used');
    if (row.expiresAt.getTime() <= Date.now()) throw new BadRequestException('Token expired');

    const newHash = await this.passwords.hash(dto.newPassword);
    await this.users.update(row.userId, { passwordHash: newHash, tokenVersion: (await this.users.findById(row.userId))?.tokenVersion + 1 });
    await this.resetRepo.markUsed(row.id);
    await this.audit.log({ performedBy: row.userId, action: 'AUTH_PASSWORD_RESET_SUCCESS' });

    return { ok: true };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.users.findById(userId);
    if (!user) throw new UnauthorizedException('Unauthorized');

    const ok = await this.passwords.compare(dto.oldPassword, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const passwordHash = await this.passwords.hash(dto.newPassword);
    await this.users.update(userId, { passwordHash, tokenVersion: user.tokenVersion + 1 });
    await this.refreshRepo.revokeAllForUser(userId);
    await this.audit.log({ performedBy: userId, action: 'AUTH_PASSWORD_CHANGED' });

    return { ok: true };
  }
}
