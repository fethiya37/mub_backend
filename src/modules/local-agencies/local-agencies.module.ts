import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';

import { PublicLocalAgenciesController } from './presentation/public-local-agencies.controller';
import { AdminLocalAgenciesController } from './presentation/admin-local-agencies.controller';
import { SelfLocalAgencyController } from './presentation/self-local-agency.controller';

import { LocalAgencyRepository } from './repositories/local-agency.repository';
import { LocalAgencyApprovalLogRepository } from './repositories/local-agency-approval-log.repository';

import { LocalAgencyPrismaRepository } from './prisma/local-agency.prisma-repository';
import { LocalAgencyApprovalLogPrismaRepository } from './prisma/local-agency-approval-log.prisma-repository';

import { LocalAgencyStatusService } from './services/local-agency-status.service';
import { LocalAgenciesService } from './services/local-agencies.service';
import { LocalAgencyReviewService } from './services/local-agency-review.service';
import { LocalAgencyAccessService } from './services/local-agency-access.service';

@Module({
  imports: [AuditModule, AuthModule, RbacModule],
  controllers: [PublicLocalAgenciesController, AdminLocalAgenciesController, SelfLocalAgencyController],
  providers: [
    PrismaService,
    LocalAgencyStatusService,
    LocalAgenciesService,
    LocalAgencyReviewService,
    LocalAgencyAccessService,
    { provide: LocalAgencyRepository, useClass: LocalAgencyPrismaRepository },
    { provide: LocalAgencyApprovalLogRepository, useClass: LocalAgencyApprovalLogPrismaRepository }
  ],
  exports: [LocalAgenciesService, LocalAgencyAccessService]
})
export class LocalAgenciesModule {}
