import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { ApplicantApplicationsController } from './presentation/applicant-applications.controller';
import { AdminApplicationsController } from './presentation/admin-applications.controller';
import { EmployerApplicationsController } from './presentation/employer-applications.controller';

import { JobApplicationsService } from './services/job-applications.service';
import { JobApplicationStatusService } from './services/job-application-status.service';

import { JobApplicationRepository } from './repositories/job-application.repository';
import { JobApplicationPrismaRepository } from './prisma/job-application.prisma-repository';

@Module({
  controllers: [ApplicantApplicationsController, AdminApplicationsController, EmployerApplicationsController],
  providers: [
    PrismaService,
    JobApplicationsService,
    JobApplicationStatusService,
    { provide: JobApplicationRepository, useClass: JobApplicationPrismaRepository }
  ],
  exports: [JobApplicationsService]
})
export class JobApplicationsModule {}
