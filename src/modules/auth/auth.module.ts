import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './presentation/auth.controller';
import { AdminAuthController } from './presentation/admin-auth.controller';
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { PasswordService } from './services/password.service';
import { LoginPolicyService } from './services/login-policy.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { RefreshTokenPrismaRepository } from './prisma/refresh-token.prisma-repository';
import { PasswordResetTokenPrismaRepository } from './prisma/password-reset-token.prisma-repository';
import { UsersModule } from '../users/users.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    UsersModule,
    RbacModule,
    AuditModule
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [
    AuthService,
    TokenService,
    PasswordService,
    LoginPolicyService,
    JwtStrategy,
    { provide: RefreshTokenRepository, useClass: RefreshTokenPrismaRepository },
    { provide: PasswordResetTokenRepository, useClass: PasswordResetTokenPrismaRepository }
  ],
  exports: [AuthService]
})
export class AuthModule {}
