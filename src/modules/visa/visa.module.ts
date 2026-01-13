import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuditModule } from '../audit/audit.module';
import { ApplicantsModule } from '../applicants/applicants.module';
import { EmployersModule } from '../employers/employers.module';
import { VisaApplicationRepository } from './repositories/visa-application.repository';
import { VisaDocumentRepository } from './repositories/visa-document.repository';
import { VisaComplianceRepository } from './repositories/visa-compliance.repository';
import { VisaNotificationRepository } from './repositories/visa-notification.repository';
import { VisaStatusHistoryRepository } from './repositories/visa-status-history.repository';
import { VisaApplicationPrismaRepository } from './prisma/visa-application.prisma-repository';
import { VisaDocumentPrismaRepository } from './prisma/visa-document.prisma-repository';
import { VisaCompliancePrismaRepository } from './prisma/visa-compliance.prisma-repository';
import { VisaNotificationPrismaRepository } from './prisma/visa-notification.prisma-repository';
import { VisaStatusHistoryPrismaRepository } from './prisma/visa-status-history.prisma-repository';
import { AdminVisaController } from './presentation/admin-visa.controller';
import { ApplicantVisaController } from './presentation/applicant-visa.controller';
import { VisaStatusService } from './services/visa-status.service';
import { VisaRulesService } from './services/visa-rules.service';
import { VisaDocumentsService } from './services/visa-documents.service';
import { VisaComplianceService } from './services/visa-compliance.service';
import { VisaNotificationsService } from './services/visa-notifications.service';
import { VisaExpiryService } from './services/visa-expiry.service';
import { VisasService } from './services/visas.service';

@Module({
  imports: [AuditModule, ApplicantsModule, EmployersModule],
  controllers: [AdminVisaController, ApplicantVisaController],
  providers: [
    PrismaService,
    VisaStatusService,
    VisaRulesService,
    VisaDocumentsService,
    VisaComplianceService,
    VisaNotificationsService,
    VisaExpiryService,
    VisasService,
    { provide: VisaApplicationRepository, useClass: VisaApplicationPrismaRepository },
    { provide: VisaDocumentRepository, useClass: VisaDocumentPrismaRepository },
    { provide: VisaComplianceRepository, useClass: VisaCompliancePrismaRepository },
    { provide: VisaNotificationRepository, useClass: VisaNotificationPrismaRepository },
    { provide: VisaStatusHistoryRepository, useClass: VisaStatusHistoryPrismaRepository }
  ],
  exports: [VisasService, VisaExpiryService]
})
export class VisaModule {}
