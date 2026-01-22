import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import crypto from 'crypto';
import { LoginDto } from '../dto/login.dto';
import { RefreshDto } from '../dto/refresh.dto';
import { AdminCreateUserDto } from '../dto/admin-create-user.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { AccountSetupDto } from '../dto/account-setup.dto';
import { RequestEmailVerificationDto } from '../dto/request-email-verification.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { UserRepository } from '../../users/repositories/user.repository';
import { PermissionEvaluatorService } from '../../rbac/services/permission-evaluator.service';
import { RbacService } from '../../rbac/services/rbac.service';
import { TokenService } from './token.service';
import { PasswordService } from './password.service';
import { LoginPolicyService } from './login-policy.service';
import { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { AuditService } from '../../audit/services/audit.service';
import { MailService } from '../../mail/services/mail.service';
import { getAccountSetupTemplate } from '../../mail/templates/account-setup.template';
import { getPasswordResetTemplate } from '../../mail/templates/password-reset.template';
import { getEmailVerifyTemplate } from '../../mail/templates/email-verify.template';
import { AccountActionTokensService } from './account-action-tokens.service';

type AdminCreatableRole = 'MUB_STAFF' | 'FINANCE_OFFICER' | 'SYSTEM';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly evaluator: PermissionEvaluatorService,
    private readonly rbac: RbacService,
    private readonly tokens: TokenService,
    private readonly passwords: PasswordService,
    private readonly loginPolicy: LoginPolicyService,
    private readonly refreshRepo: RefreshTokenRepository,
    private readonly actionTokens: AccountActionTokensService,
    private readonly audit: AuditService,
    private readonly mail: MailService
  ) {}

  async login(dto: LoginDto, ctx?: { ip?: string | null; ua?: string | null }) {
    const user = await this.users.findByIdentifier(dto.identifier);
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('User is deactivated');

    this.loginPolicy.ensureNotLocked(user);

    const ok = await this.passwords.compare(dto.password, user.passwordHash);
    if (!ok) {
      await this.loginPolicy.onFailedLogin(user);
      await this.audit.log({
        performedBy: user.id,
        action: 'AUTH_LOGIN_FAILED',
        ipAddress: ctx?.ip ?? null,
        userAgent: ctx?.ua ?? null
      });
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

    await this.audit.log({
      performedBy: user.id,
      action: 'AUTH_LOGIN_SUCCESS',
      ipAddress: ctx?.ip ?? null,
      userAgent: ctx?.ua ?? null
    });

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
    const allowed: Record<string, true> = { MUB_STAFF: true, FINANCE_OFFICER: true, SYSTEM: true };
    if (!allowed[dto.role]) throw new BadRequestException('Role cannot be created directly');

    const existsPhone = await this.users.findByIdentifier(dto.phone);
    if (existsPhone) throw new ConflictException('Phone already exists');

    const existsEmail = await this.users.findByIdentifier(dto.email);
    if (existsEmail) throw new ConflictException('Email already exists');

    const unusablePassword = crypto.randomBytes(24).toString('base64url');
    const passwordHash = await this.passwords.hash(unusablePassword);

    const user = await this.users.create({
      phone: dto.phone,
      email: dto.email,
      passwordHash,
      isActive: true,
      applicantVerified: true
    });

    await this.rbac.replaceUserRoles(user.id, [dto.role as AdminCreatableRole]);

    await this.audit.log({
      performedBy,
      action: 'ADMIN_CREATE_USER',
      entityType: 'User',
      entityId: user.id,
      meta: { role: dto.role }
    });

    await this.sendAccountSetupEmail(user.id, dto.email, dto.role);

    return { ok: true, userId: user.id };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.users.findByIdentifier(dto.email);
    if (!user || !user.email) return { ok: true };

    const mins = process.env.PASSWORD_RESET_EXPIRES_MINUTES ? Number(process.env.PASSWORD_RESET_EXPIRES_MINUTES) : 20;
    const expiresAt = new Date(Date.now() + mins * 60 * 1000);

    await this.actionTokens.invalidateAllForUser(user.id, 'PASSWORD_RESET');
    const raw = await this.actionTokens.issue(user.id, 'PASSWORD_RESET', expiresAt);

    const base = process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173';
    const resetUrl = `${base}/auth/reset-password?token=${encodeURIComponent(raw)}`;
    const appName = process.env.APP_NAME ?? 'MUB System';

    await this.mail.sendHtml(user.email, `${appName} Password Reset`, getPasswordResetTemplate(appName, resetUrl));
    await this.audit.log({ performedBy: user.id, action: 'AUTH_PASSWORD_RESET_REQUEST' });

    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const row = await this.actionTokens.consume(dto.token, 'PASSWORD_RESET');

    const user = await this.users.findById(row.userId);
    if (!user) throw new BadRequestException('Invalid token');

    const newHash = await this.passwords.hash(dto.newPassword);
    await this.users.update(row.userId, { passwordHash: newHash, tokenVersion: user.tokenVersion + 1 });

    await this.refreshRepo.revokeAllForUser(row.userId);
    await this.audit.log({ performedBy: row.userId, action: 'AUTH_PASSWORD_RESET_SUCCESS' });

    return { ok: true };
  }

  async completeAccountSetup(dto: AccountSetupDto) {
    const row = await this.actionTokens.consume(dto.token, 'ACCOUNT_SETUP');

    const user = await this.users.findById(row.userId);
    if (!user) throw new BadRequestException('Invalid token');

    const passwordHash = await this.passwords.hash(dto.newPassword);
    await this.users.update(user.id, { passwordHash, tokenVersion: user.tokenVersion + 1, isActive: true });

    await this.refreshRepo.revokeAllForUser(user.id);
    await this.audit.log({ performedBy: user.id, action: 'ACCOUNT_SETUP_COMPLETE' });

    return { ok: true };
  }

  async requestEmailVerification(dto: RequestEmailVerificationDto) {
    const user = await this.users.findByIdentifier(dto.email);
    if (!user || !user.email) return { ok: true };

    const mins = process.env.EMAIL_VERIFY_EXPIRES_MINUTES ? Number(process.env.EMAIL_VERIFY_EXPIRES_MINUTES) : 1440;
    const expiresAt = new Date(Date.now() + mins * 60 * 1000);

    await this.actionTokens.invalidateAllForUser(user.id, 'EMAIL_VERIFY');
    const raw = await this.actionTokens.issue(user.id, 'EMAIL_VERIFY', expiresAt);

    const base = process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173';
    const verifyUrl = `${base}/auth/verify-email?token=${encodeURIComponent(raw)}`;
    const appName = process.env.APP_NAME ?? 'MUB System';

    await this.mail.sendHtml(user.email, `${appName} Verify Email`, getEmailVerifyTemplate(appName, verifyUrl));
    await this.audit.log({ performedBy: user.id, action: 'EMAIL_VERIFY_REQUESTED' });

    return { ok: true };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const row = await this.actionTokens.consume(dto.token, 'EMAIL_VERIFY');

    const user = await this.users.findById(row.userId);
    if (!user || !user.email) throw new BadRequestException('Invalid token');

    await this.audit.log({ performedBy: user.id, action: 'EMAIL_VERIFIED' });
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

  async sendAccountSetupEmail(userId: string, email: string, receiverName: string) {
    const mins = process.env.ACCOUNT_SETUP_EXPIRES_MINUTES ? Number(process.env.ACCOUNT_SETUP_EXPIRES_MINUTES) : 1440;
    const expiresAt = new Date(Date.now() + mins * 60 * 1000);

    await this.actionTokens.invalidateAllForUser(userId, 'ACCOUNT_SETUP');
    const raw = await this.actionTokens.issue(userId, 'ACCOUNT_SETUP', expiresAt);

    const base = process.env.FRONTEND_BASE_URL ?? 'http://localhost:5173';
    const setupUrl = `${base}/account/setup?token=${encodeURIComponent(raw)}`;
    const appName = process.env.APP_NAME ?? 'MUB System';

    await this.mail.sendHtml(email, `${appName} Account Setup`, getAccountSetupTemplate(appName, receiverName, setupUrl));
    await this.audit.log({ performedBy: userId, action: 'ACCOUNT_SETUP_LINK_SENT' });

    return { ok: true };
  }
}
