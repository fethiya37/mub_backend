import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { ApplicantsBySourceController } from './presentation/applicants-by-source.controller';
import { ApplicantsBySourceService } from './services/applicants-by-source.service';

import { PerformanceReportController } from './presentation/performance.controller';
import { PerformanceReportService } from './services/performance.service';

import { VisaMedicalReportController } from './presentation/visa-medical-report.controller';
import { VisaMedicalReportService } from './services/visa-medical-report.service';

@Module({
  controllers: [ApplicantsBySourceController, PerformanceReportController, VisaMedicalReportController],
  providers: [PrismaService, ApplicantsBySourceService, PerformanceReportService, VisaMedicalReportService]
})
export class ReportsModule {}
