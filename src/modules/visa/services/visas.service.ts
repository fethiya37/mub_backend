import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { $Enums } from '@prisma/client';

import { VisaCaseRepository } from '../repositories/visa-case.repository';
import { VisaAttemptRepository } from '../repositories/visa-attempt.repository';
import { VisaMedicalRepository } from '../repositories/visa-medical.repository';
import { VisaInsuranceRepository } from '../repositories/visa-insurance.repository';
import { VisaFingerprintRepository } from '../repositories/visa-fingerprint.repository';
import { EmbassyProcessRepository } from '../repositories/embassy-process.repository';
import { LMISProcessRepository } from '../repositories/lmis-process.repository';
import { FlightBookingRepository } from '../repositories/flight-booking.repository';
import { VisaReturnRepository } from '../repositories/visa-return.repository';

import { VisaAccessService } from './visa-access.service';
import { VisaStatusService } from './visa-status.service';
import { VisaAttemptNumberService } from './visa-attempt-number.service';

import type { AdminCreateVisaCaseDto } from '../dto/admin/admin-create-visa-case.dto';
import type { AdminAssignCaseManagerDto } from '../dto/admin/admin-assign-case-manager.dto';
import type { AdminListVisaCasesQueryDto } from '../dto/admin/admin-list-visa-cases.query.dto';
import type { AdminUpsertMedicalDto } from '../dto/admin/admin-upsert-medical.dto';
import type { AdminUpsertInsuranceDto } from '../dto/admin/admin-upsert-insurance.dto';
import type { AdminSetFingerprintDto } from '../dto/admin/admin-set-fingerprint.dto';
import type { AdminUpsertEmbassyProcessDto } from '../dto/admin/admin-upsert-embassy-process.dto';
import type { AdminUpsertLmisProcessDto } from '../dto/admin/admin-upsert-lmis-process.dto';
import type { AdminCreateVisaAttemptDto } from '../dto/admin/admin-create-visa-attempt.dto';
import type { AdminCreateFlightBookingDto } from '../dto/admin/admin-create-flight-booking.dto';
import type { AdminCreateVisaReturnDto } from '../dto/admin/admin-create-visa-return.dto';
import type { AdminCloseVisaCaseDto } from '../dto/admin/admin-close-visa-case.dto';
import type { ApplicantListVisaCasesQueryDto } from '../dto/applicant/applicant-list-visa-cases.query.dto';
import type { EmployerListVisaCasesQueryDto } from '../dto/employer/employer-list-visa-cases.query.dto';

@Injectable()
export class VisasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cases: VisaCaseRepository,
    private readonly attempts: VisaAttemptRepository,
    private readonly medical: VisaMedicalRepository,
    private readonly insurance: VisaInsuranceRepository,
    private readonly fingerprint: VisaFingerprintRepository,
    private readonly embassy: EmbassyProcessRepository,
    private readonly lmis: LMISProcessRepository,
    private readonly flights: FlightBookingRepository,
    private readonly returns: VisaReturnRepository,
    private readonly access: VisaAccessService,
    private readonly status: VisaStatusService,
    private readonly attemptNumbers: VisaAttemptNumberService
  ) {}

  private page(v?: number) {
    return v && v > 0 ? v : 1;
  }

  private pageSize(v?: number, def = 50) {
    const n = v && v > 0 ? v : def;
    return n > 200 ? 200 : n;
  }

  private applicantName(a: any) {
    const name = [a?.firstName, a?.middleName, a?.lastName].map((x: string | null | undefined) => (x ?? '').trim()).filter(Boolean).join(' ').trim();
    if (name.length) return name;
    if (a?.phone) return a.phone;
    return null;
  }

  private caseManagerName(u: any) {
    if (u?.fullName && String(u.fullName).trim().length) return String(u.fullName).trim();
    if (u?.phone) return u.phone;
    if (u?.email) return u.email;
    return null;
  }

  private toCaseListItem(item: any) {
    return {
      id: item.id,
      applicantId: item.applicantId,
      applicantName: this.applicantName(item.applicant),
      partnerId: item.partnerId ?? null,
      partnerName: item.partner?.organizationName ?? null,
      jobId: item.jobId ?? null,
      jobTitle: item.job?.jobTitle ?? null,
      destinationCountry: item.destinationCountry,
      status: item.status,
      isActive: item.isActive,
      caseManagerUserId: item.caseManagerUserId,
      caseManagerName: this.caseManagerName(item.caseManager),
      sponsorId: item.sponsorId ?? null,
      sponsorName: item.sponsor?.fullName ?? null,
      completedStatuses: item.completedStatuses ?? [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    };
  }

  private async setStatusAndMaybeComplete(visaCaseId: string, status: $Enums.VisaCaseStatus, complete?: $Enums.VisaCaseStatus) {
    const current = await this.prisma.visaCase.findUnique({
      where: { id: visaCaseId },
      select: { completedStatuses: true }
    });
    if (!current) throw new NotFoundException('Visa case not found');

    const completedStatuses = complete
      ? Array.from(new Set([...(current.completedStatuses ?? []), complete]))
      : current.completedStatuses ?? [];

    await this.cases.update(visaCaseId, {
      status,
      completedStatuses
    });
  }

  async adminCreateCase(adminUserId: string, dto: AdminCreateVisaCaseDto) {
    await this.ensureApplicantExists(dto.applicantId);

    if (dto.partnerId) await this.ensureEmployerExists(dto.partnerId);
    if (dto.jobId) await this.ensureJobExists(dto.jobId);
    if (dto.sponsorId) await this.ensureSponsorExists(dto.sponsorId);

    const input = {
      applicantId: dto.applicantId,
      partnerId: dto.partnerId ?? null,
      jobId: dto.jobId ?? null,
      destinationCountry: dto.destinationCountry,
      caseManagerUserId: adminUserId,
      sponsorId: dto.sponsorId ?? null
    };

    return this.cases.create(input);
  }

  async adminListCases(q: AdminListVisaCasesQueryDto) {
    const r = await this.cases.listAdmin(
      {
        applicantId: q.applicantId,
        partnerId: q.partnerId,
        jobId: q.jobId,
        status: q.status,
        isActive: q.isActive
      },
      this.page(q.page),
      this.pageSize(q.pageSize, 50)
    );

    return {
      ...r,
      items: r.items.map((x: any) => this.toCaseListItem(x))
    };
  }

  async adminAssignCaseManager(_adminUserId: string, visaCaseId: string, dto: AdminAssignCaseManagerDto) {
    const c = await this.getCaseOrThrow(visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    await this.ensureUserExists(dto.caseManagerUserId);

    return this.cases.update(visaCaseId, {
      caseManagerUserId: dto.caseManagerUserId
    });
  }

  async adminUpsertMedical(_adminUserId: string, dto: AdminUpsertMedicalDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    if (!dto.reportFileUrl) throw new BadRequestException('reportFileUrl is required');

    const medical = await this.medical.upsert({
      visaCaseId: dto.visaCaseId,
      reportFileUrl: dto.reportFileUrl,
      result: dto.result,
      expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null
    });

    await this.setStatusAndMaybeComplete(dto.visaCaseId, this.status.statusForMedical(), $Enums.VisaCaseStatus.MEDICAL);

    return medical;
  }

  async adminUpsertInsurance(_adminUserId: string, dto: AdminUpsertInsuranceDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const insurance = await this.insurance.upsert({
      visaCaseId: dto.visaCaseId,
      providerName: dto.providerName ?? null,
      policyNumber: dto.policyNumber ?? null,
      policyFileUrl: dto.policyFileUrl ?? null
    });

    await this.setStatusAndMaybeComplete(dto.visaCaseId, this.status.statusForInsurance(), $Enums.VisaCaseStatus.INSURANCE);

    return insurance;
  }

  async adminSetFingerprint(_adminUserId: string, visaCaseId: string, dto: AdminSetFingerprintDto) {
    const c = await this.getCaseOrThrow(visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const fp = await this.fingerprint.upsert({ visaCaseId, isDone: dto.isDone });

    await this.setStatusAndMaybeComplete(
      visaCaseId,
      this.status.statusForFingerprint(),
      dto.isDone ? $Enums.VisaCaseStatus.FINGERPRINT : undefined
    );

    return fp;
  }

  async adminUpsertEmbassy(_adminUserId: string, dto: AdminUpsertEmbassyProcessDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const ep = await this.embassy.upsert({ visaCaseId: dto.visaCaseId, status: dto.status });

    await this.setStatusAndMaybeComplete(
      dto.visaCaseId,
      this.status.statusForEmbassy(),
      dto.status === 'COMPLETED' ? $Enums.VisaCaseStatus.EMBASSY : undefined
    );

    return ep;
  }

  async adminUpsertLMIS(_adminUserId: string, dto: AdminUpsertLmisProcessDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const lp = await this.lmis.upsert({ visaCaseId: dto.visaCaseId, status: dto.status });

    await this.setStatusAndMaybeComplete(
      dto.visaCaseId,
      this.status.statusForLMIS(),
      dto.status !== 'PENDING' ? $Enums.VisaCaseStatus.LMIS : undefined
    );

    return lp;
  }

  async adminCreateAttempt(_adminUserId: string, dto: AdminCreateVisaAttemptDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const created = await this.prisma.$transaction(async (tx) => {
      const max = await tx.visaAttempt.aggregate({
        where: { visaCaseId: dto.visaCaseId },
        _max: { attemptNumber: true }
      });

      const attemptNumber = (max._max.attemptNumber ?? 0) + 1;

      return tx.visaAttempt.create({
        data: {
          visaCaseId: dto.visaCaseId,
          attemptNumber,
          status: dto.status,
          applicationNumber: dto.applicationNumber ?? null,
          visaNumber: dto.visaNumber ?? null,
          issuedAt: dto.issuedAt ? new Date(dto.issuedAt) : null,
          expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
          rejectionReason: dto.rejectionReason ?? null,
          barcodeValue: dto.barcodeValue ?? null,
          barcodeImageUrl: dto.barcodeImageUrl ?? null
        }
      });
    });

    await this.setStatusAndMaybeComplete(dto.visaCaseId, this.status.statusForVisaAttempt(), $Enums.VisaCaseStatus.VISA);

    return created;
  }

  async adminCreateFlight(_adminUserId: string, dto: AdminCreateFlightBookingDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const created = await this.flights.create({
      visaCaseId: dto.visaCaseId,
      pnr: dto.pnr,
      airline: dto.airline ?? null,
      departureAt: dto.departureAt ? new Date(dto.departureAt) : null,
      arrivalAt: dto.arrivalAt ? new Date(dto.arrivalAt) : null
    });

    await this.setStatusAndMaybeComplete(
      dto.visaCaseId,
      this.status.statusForFlightBooking(),
      $Enums.VisaCaseStatus.FLIGHT_BOOKED
    );

    return created;
  }

  async adminCreateReturn(_adminUserId: string, dto: AdminCreateVisaReturnDto) {
    const c = await this.getCaseOrThrow(dto.visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    const created = await this.returns.create({
      visaCaseId: dto.visaCaseId,
      reason: dto.reason
    });

    await this.setStatusAndMaybeComplete(dto.visaCaseId, this.status.statusForReturn(), $Enums.VisaCaseStatus.RETURNED);

    return created;
  }

  async adminMarkDeployed(_adminUserId: string, visaCaseId: string) {
    const c = await this.getCaseOrThrow(visaCaseId);
    this.status.ensureCaseActive(c.isActive);

    if (c.status === this.status.statusForClosed()) {
      throw new BadRequestException('Cannot deploy a closed case');
    }

    await this.setStatusAndMaybeComplete(visaCaseId, this.status.statusForDeployed(), $Enums.VisaCaseStatus.DEPLOYED);

    return this.cases.findById(visaCaseId);
  }

  async adminCloseCase(_adminUserId: string, visaCaseId: string, dto: AdminCloseVisaCaseDto) {
    const c = await this.getCaseOrThrow(visaCaseId);
    this.status.ensureCanClose(c.status);

    if (dto.isActive !== false) throw new BadRequestException('Closing requires isActive=false');

    const current = await this.prisma.visaCase.findUnique({
      where: { id: visaCaseId },
      select: { completedStatuses: true }
    });
    if (!current) throw new NotFoundException('Visa case not found');

    const completedStatuses = Array.from(new Set([...(current.completedStatuses ?? []), $Enums.VisaCaseStatus.CLOSED]));

    return this.cases.update(visaCaseId, {
      isActive: false,
      status: this.status.statusForClosed(),
      completedStatuses
    });
  }

  async applicantListCases(userId: string, q: ApplicantListVisaCasesQueryDto) {
    const applicantId = await this.access.applicantIdForUser(userId);

    const r = await this.cases.listApplicant(
      { applicantId, status: q.status, isActive: q.isActive },
      this.page(q.page),
      this.pageSize(q.pageSize, 20)
    );

    return {
      ...r,
      items: r.items.map((x: any) => this.toCaseListItem(x))
    };
  }

  async employerListCases(userId: string, q: EmployerListVisaCasesQueryDto) {
    const employerId = await this.access.employerIdForUser(userId);

    const r = await this.cases.listEmployer(
      { employerId, jobId: q.jobId, status: q.status, isActive: q.isActive },
      this.page(q.page),
      this.pageSize(q.pageSize, 50)
    );

    return {
      ...r,
      items: r.items.map((x: any) => this.toCaseListItem(x))
    };
  }

  private async getCaseOrThrow(id: string) {
    const c = await this.cases.findById(id);
    if (!c) throw new NotFoundException('Visa case not found');
    return c;
  }

  private async ensureApplicantExists(applicantId: string) {
    const a = await this.prisma.applicantProfile.findUnique({ where: { applicantId }, select: { applicantId: true } });
    if (!a) throw new NotFoundException('Applicant not found');
  }

  private async ensureEmployerExists(employerId: string) {
    const e = await this.prisma.employer.findUnique({ where: { id: employerId }, select: { id: true } });
    if (!e) throw new NotFoundException('Employer not found');
  }

  private async ensureJobExists(jobId: string) {
    const j = await this.prisma.jobPosting.findUnique({ where: { id: jobId }, select: { id: true } });
    if (!j) throw new NotFoundException('Job not found');
  }

  private async ensureSponsorExists(sponsorId: string) {
    const s = await this.prisma.sponsor.findUnique({ where: { id: sponsorId }, select: { id: true } });
    if (!s) throw new NotFoundException('Sponsor not found');
  }

  private async ensureUserExists(userId: string) {
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!u) throw new NotFoundException('User not found');
  }
}
