import { Module } from '@nestjs/common';
import { PublicApplicantsController } from './presentation/public-applicants.controller';
import { AdminApplicantsController } from './presentation/admin-applicants.controller';
import { ApplicantsController } from './presentation/applicants.controller';
import { ApplicantsService } from './services/applicants.service';
import { ApplicantStatusService } from './services/applicant-status.service';
import { ApplicantVerificationService } from './services/applicant-verification.service';
import { ApplicantProfileRepository } from './repositories/applicant-profile.repository';
import { ApplicantSkillRepository } from './repositories/applicant-skill.repository';
import { ApplicantQualificationRepository } from './repositories/applicant-qualification.repository';
import { ApplicantWorkExperienceRepository } from './repositories/applicant-work-experience.repository';
import { ApplicantDocumentRepository } from './repositories/applicant-document.repository';
import { ApplicantProfilePrismaRepository } from './prisma/applicant-profile.prisma-repository';
import { ApplicantSkillPrismaRepository } from './prisma/applicant-skill.prisma-repository';
import { ApplicantQualificationPrismaRepository } from './prisma/applicant-qualification.prisma-repository';
import { ApplicantWorkExperiencePrismaRepository } from './prisma/applicant-work-experience.prisma-repository';
import { ApplicantDocumentPrismaRepository } from './prisma/applicant-document.prisma-repository';
import { UsersModule } from '../users/users.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [UsersModule, AuditModule],
  controllers: [PublicApplicantsController, AdminApplicantsController, ApplicantsController],
  providers: [
    ApplicantsService,
    ApplicantStatusService,
    ApplicantVerificationService,
    { provide: ApplicantProfileRepository, useClass: ApplicantProfilePrismaRepository },
    { provide: ApplicantSkillRepository, useClass: ApplicantSkillPrismaRepository },
    { provide: ApplicantQualificationRepository, useClass: ApplicantQualificationPrismaRepository },
    { provide: ApplicantWorkExperienceRepository, useClass: ApplicantWorkExperiencePrismaRepository },
    { provide: ApplicantDocumentRepository, useClass: ApplicantDocumentPrismaRepository }
  ],
  exports: [ApplicantsService]
})
export class ApplicantsModule {}
