import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { configuration } from './config/configuration';
import { envValidation } from './config/env.validation';
import { throttleConfig } from './config/throttle.config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RbacModule } from './modules/rbac/rbac.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthModule } from './modules/health/health.module';
import { appGuards } from './app.guards';
import { ApplicantsModule } from './modules/applicants/applicants.module';
import { EmployersModule } from './modules/employers/employers.module';
import { MailModule } from './modules/mail/mail.module';
import { CvModule } from './modules/cv/cv.module';
import { VisaModule } from './modules/visa/visa.module';
import { LocalAgenciesModule } from './modules/local-agencies/local-agencies.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: envValidation
    }),


    ThrottlerModule.forRoot(throttleConfig()),
    PrismaModule,
    AuditModule,
    RbacModule,
    UsersModule,
    AuthModule,
    HealthModule,
    ApplicantsModule,
    EmployersModule,
    MailModule,
    CvModule,
    VisaModule,
    LocalAgenciesModule
  ],
  providers: [...appGuards]
})
export class AppModule { }
