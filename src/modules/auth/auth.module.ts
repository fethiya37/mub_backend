import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/auth.controller';
import { AdminAuthController } from './presentation/admin-auth.controller';
import { AccountController } from './presentation/account.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { LoginPolicyService } from './services/login-policy.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { AccountActionTokenRepository } from './repositories/account-action-token.repository';
import { RefreshTokenPrismaRepository } from './prisma/refresh-token.prisma-repository';
import { AccountActionTokenPrismaRepository } from './prisma/account-action-token.prisma-repository';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';
import { MailModule } from '../mail/mail.module';
import { AccountActionTokensService } from './services/account-action-tokens.service';
import { PrismaService } from '../../database/prisma.service';
import { UserRepository } from '../users/repositories/user.repository';
import { UserPrismaRepository } from '../users/prisma/user.prisma-repository';

@Module({
  imports: [PassportModule, JwtModule.register({}), RbacModule, AuditModule, MailModule],
  controllers: [AuthController, AdminAuthController, AccountController],
  providers: [
    PrismaService,
    { provide: UserRepository, useClass: UserPrismaRepository },
    AuthService,
    TokenService,
    PasswordService,
    LoginPolicyService,
    AccountActionTokensService,
    JwtStrategy,
    { provide: RefreshTokenRepository, useClass: RefreshTokenPrismaRepository },
    { provide: AccountActionTokenRepository, useClass: AccountActionTokenPrismaRepository }
  ],
  exports: [AuthService, PasswordService]
})
export class AuthModule {}
