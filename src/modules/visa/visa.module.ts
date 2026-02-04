import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

import { AdminVisaController } from './presentation/admin-visa.controller';
import { ApplicantVisaController } from './presentation/applicant-visa.controller';
import { EmployerVisasController } from './presentation/employer-visas.controller';
import { AgencyVisasController } from './presentation/agency-visas.controller';

import { VisaAccessService } from './services/visa-access.service';
import { VisaStatusService } from './services/visa-status.service';
import { VisaAttemptNumberService } from './services/visa-attempt-number.service';
import { SponsorsService } from './services/sponsors.service';
import { VisasService } from './services/visas.service';

import { SponsorRepository } from './repositories/sponsor.repository';
import { VisaCaseRepository } from './repositories/visa-case.repository';
import { VisaMedicalRepository } from './repositories/visa-medical.repository';
import { VisaInsuranceRepository } from './repositories/visa-insurance.repository';
import { VisaFingerprintRepository } from './repositories/visa-fingerprint.repository';
import { EmbassyProcessRepository } from './repositories/embassy-process.repository';
import { LMISProcessRepository } from './repositories/lmis-process.repository';
import { VisaAttemptRepository } from './repositories/visa-attempt.repository';
import { FlightBookingRepository } from './repositories/flight-booking.repository';
import { VisaReturnRepository } from './repositories/visa-return.repository';

import { SponsorPrismaRepository } from './prisma/sponsor.prisma-repository';
import { VisaCasePrismaRepository } from './prisma/visa-case.prisma-repository';
import { VisaMedicalPrismaRepository } from './prisma/visa-medical.prisma-repository';
import { VisaInsurancePrismaRepository } from './prisma/visa-insurance.prisma-repository';
import { VisaFingerprintPrismaRepository } from './prisma/visa-fingerprint.prisma-repository';
import { EmbassyProcessPrismaRepository } from './prisma/embassy-process.prisma-repository';
import { LMISProcessPrismaRepository } from './prisma/lmis-process.prisma-repository';
import { VisaAttemptPrismaRepository } from './prisma/visa-attempt.prisma-repository';
import { FlightBookingPrismaRepository } from './prisma/flight-booking.prisma-repository';
import { VisaReturnPrismaRepository } from './prisma/visa-return.prisma-repository';
import { AdminSponsorsController } from './presentation/admin-sponsors.controller';

@Module({
  controllers: [AdminVisaController, ApplicantVisaController, EmployerVisasController, AgencyVisasController, AdminSponsorsController],
  providers: [
    PrismaService,

    VisaAccessService,
    VisaStatusService,
    VisaAttemptNumberService,
    SponsorsService,
    VisasService,

    { provide: SponsorRepository, useClass: SponsorPrismaRepository },
    { provide: VisaCaseRepository, useClass: VisaCasePrismaRepository },
    { provide: VisaMedicalRepository, useClass: VisaMedicalPrismaRepository },
    { provide: VisaInsuranceRepository, useClass: VisaInsurancePrismaRepository },
    { provide: VisaFingerprintRepository, useClass: VisaFingerprintPrismaRepository },
    { provide: EmbassyProcessRepository, useClass: EmbassyProcessPrismaRepository },
    { provide: LMISProcessRepository, useClass: LMISProcessPrismaRepository },
    { provide: VisaAttemptRepository, useClass: VisaAttemptPrismaRepository },
    { provide: FlightBookingRepository, useClass: FlightBookingPrismaRepository },
    { provide: VisaReturnRepository, useClass: VisaReturnPrismaRepository }
  ],
  exports: [VisasService]
})
export class VisaModule {}
