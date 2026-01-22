import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { EmployersPublicController } from './presentation/employers-public.controller';
import { AdminEmployersController } from './presentation/admin-employers.controller';
import { EmployerJobsController } from './presentation/employer-jobs.controller';
import { PublicJobsController } from './presentation/public-jobs.controller';
import { EmployersService } from './services/employers.service';
import { EmployerApprovalService } from './services/employer-approval.service';
import { EmployerAccessService } from './services/employer-access.service';
import { EmployerJobsService } from './services/employer-jobs.service';
import { PublicJobsService } from './services/public-jobs.service';
import { EmployerRegistrationNumberService } from './services/employer-registration-number.service';
import { EmployerValidationService } from './services/employer-validation.service';
import { EmployerRepository } from './repositories/employer.repository';
import { EmployerApprovalLogRepository } from './repositories/employer-approval-log.repository';
import { JobPostingRepository } from './repositories/job-posting.repository';
import { EmployerPrismaRepository } from './prisma/employer.prisma-repository';
import { EmployerApprovalLogPrismaRepository } from './prisma/employer-approval-log.prisma-repository';
import { JobPostingPrismaRepository } from './prisma/job-posting.prisma-repository';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { RbacModule } from '../rbac/rbac.module';

@Module({
  imports: [AuditModule, AuthModule, RbacModule],
  controllers: [EmployersPublicController, AdminEmployersController, EmployerJobsController, PublicJobsController],
  providers: [
    PrismaService,
    EmployersService,
    EmployerApprovalService,
    EmployerAccessService,
    EmployerJobsService,
    PublicJobsService,
    EmployerRegistrationNumberService,
    EmployerValidationService,
    { provide: EmployerRepository, useClass: EmployerPrismaRepository },
    { provide: EmployerApprovalLogRepository, useClass: EmployerApprovalLogPrismaRepository },
    { provide: JobPostingRepository, useClass: JobPostingPrismaRepository }
  ],
  exports: [JobPostingRepository, EmployerAccessService, EmployerRepository]
})
export class EmployersModule {}
