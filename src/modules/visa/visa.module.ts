import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { EmployerVisasController } from './presentation/employer-visas.controller';
import { AgencyVisasController } from './presentation/agency-visas.controller';

import { VisaApplicationRepository } from './repositories/visa-application.repository';
import { VisaDocumentRepository } from './repositories/visa-document.repository';
import { VisaComplianceRepository } from './repositories/visa-compliance.repository';
import { VisaStatusHistoryRepository } from './repositories/visa-status-history.repository';
import { VisaNotificationRepository } from './repositories/visa-notification.repository';

import { VisaApplicationPrismaRepository } from './prisma/visa-application.prisma-repository';
import { VisaDocumentPrismaRepository } from './prisma/visa-document.prisma-repository';
import { VisaCompliancePrismaRepository } from './prisma/visa-compliance.prisma-repository';
import { VisaStatusHistoryPrismaRepository } from './prisma/visa-status-history.prisma-repository';
import { VisaNotificationPrismaRepository } from './prisma/visa-notification.prisma-repository';

import { VisasService } from './services/visas.service';
import { VisaDocumentsService } from './services/visa-documents.service';
import { VisaComplianceService } from './services/visa-compliance.service';
import { VisaStatusService } from './services/visa-status.service';
import { VisaNotificationsService } from './services/visa-notifications.service';
import { VisaAccessService } from './services/visa-access.service';
import { AdminVisasController } from './presentation/admin-visa.controller';
import { ApplicantVisasController } from './presentation/applicant-visa.controller';

@Module({
  controllers: [AdminVisasController, ApplicantVisasController, EmployerVisasController, AgencyVisasController],
  providers: [
    PrismaService,
    VisaStatusService,
    VisaNotificationsService,
    VisaAccessService,
    VisasService,
    VisaDocumentsService,
    VisaComplianceService,
    { provide: VisaApplicationRepository, useClass: VisaApplicationPrismaRepository },
    { provide: VisaDocumentRepository, useClass: VisaDocumentPrismaRepository },
    { provide: VisaComplianceRepository, useClass: VisaCompliancePrismaRepository },
    { provide: VisaStatusHistoryRepository, useClass: VisaStatusHistoryPrismaRepository },
    { provide: VisaNotificationRepository, useClass: VisaNotificationPrismaRepository }
  ],
  exports: [VisasService]
})
export class VisasModule {}
