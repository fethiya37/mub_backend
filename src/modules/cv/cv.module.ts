import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ApplicantsModule } from '../applicants/applicants.module';
import { EmployersModule } from '../employers/employers.module';
import { AuditModule } from '../audit/audit.module';

import { CvTemplatesController } from './presentation/cv-templates.controller';
import { AdminCvTemplatesController } from './presentation/admin-cv-templates.controller';
import { ApplicantCvController } from './presentation/applicant-cv.controller';
import { AdminCvsController } from './presentation/admin-cvs.controller';

import { CvTemplateRepository } from './repositories/cv-template.repository';
import { ApplicantCvRepository } from './repositories/applicant-cv.repository';
import { ApplicantCvSectionRepository } from './repositories/applicant-cv-section.repository';
import { ApplicantCvVersionRepository } from './repositories/applicant-cv-version.repository';
import { CvAdminReviewRepository } from './repositories/cv-admin-review.repository';
import { CvAuditLogRepository } from './repositories/cv-audit-log.repository';

import { CvTemplatePrismaRepository } from './prisma/cv-template.prisma-repository';
import { ApplicantCvPrismaRepository } from './prisma/applicant-cv.prisma-repository';
import { ApplicantCvSectionPrismaRepository } from './prisma/applicant-cv-section.prisma-repository';
import { ApplicantCvVersionPrismaRepository } from './prisma/applicant-cv-version.prisma-repository';
import { CvAdminReviewPrismaRepository } from './prisma/cv-admin-review.prisma-repository';
import { CvAuditLogPrismaRepository } from './prisma/cv-audit-log.prisma-repository';

import { FileStorageService } from './storage/file-storage.service';

import { CvStatusService } from './services/cv-status.service';
import { CvAccessService } from './services/cv-access.service';
import { CvAuditService } from './services/cv-audit.service';
import { CvTemplateService } from './services/cv-template.service';
import { CvDraftService } from './services/cv-draft.service';
import { CvRenderService } from './services/cv-render.service';
import { CvPdfService } from './services/cv-pdf.service';
import { CvGenerationService } from './services/cv-generation.service';
import { CvAdminReviewService } from './services/cv-admin-review.service';

@Module({
  imports: [ApplicantsModule, EmployersModule, AuditModule],
  controllers: [CvTemplatesController, AdminCvTemplatesController, ApplicantCvController, AdminCvsController],
  providers: [
    PrismaService,
    FileStorageService,

    CvStatusService,
    CvAccessService,
    CvAuditService,
    CvTemplateService,
    CvDraftService,
    CvRenderService,
    CvPdfService,
    CvGenerationService,
    CvAdminReviewService,

    { provide: CvTemplateRepository, useClass: CvTemplatePrismaRepository },
    { provide: ApplicantCvRepository, useClass: ApplicantCvPrismaRepository },
    { provide: ApplicantCvSectionRepository, useClass: ApplicantCvSectionPrismaRepository },
    { provide: ApplicantCvVersionRepository, useClass: ApplicantCvVersionPrismaRepository },
    { provide: CvAdminReviewRepository, useClass: CvAdminReviewPrismaRepository },
    { provide: CvAuditLogRepository, useClass: CvAuditLogPrismaRepository }
  ],
  exports: [CvTemplateService, CvGenerationService]
})
export class CvModule {}
