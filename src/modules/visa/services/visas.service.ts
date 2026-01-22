import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';
import { VisaStatusHistoryRepository } from '../repositories/visa-status-history.repository';
import { VisaComplianceRepository } from '../repositories/visa-compliance.repository';
import { VisaDocumentRepository } from '../repositories/visa-document.repository';
import { VisaStatusService } from './visa-status.service';
import { VisaNotificationsService } from './visa-notifications.service';
import { VisaAccessService } from './visa-access.service';

@Injectable()
export class VisasService {
  private readonly requiredDocs: readonly string[] = [
    'PASSPORT',
    'MEDICAL_CLEARANCE',
    'POLICE_CLEARANCE',
    'EMPLOYMENT_CONTRACT',
    'INVITATION_LETTER',
    'EMBASSY_FORMS'
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly repo: VisaApplicationRepository,
    private readonly history: VisaStatusHistoryRepository,
    private readonly compliance: VisaComplianceRepository,
    private readonly docs: VisaDocumentRepository,
    private readonly status: VisaStatusService,
    private readonly notifications: VisaNotificationsService,
    private readonly access: VisaAccessService
  ) {}

  async createDraft(adminUserId: string, dto: any) {
    const applicant = await this.prisma.applicantProfile.findUnique({
      where: { applicantId: dto.applicantId },
      select: { applicantId: true, profileStatus: true }
    });
    if (!applicant) throw new NotFoundException('Applicant not found');
    if (applicant.profileStatus !== 'VERIFIED') throw new BadRequestException('Applicant must be VERIFIED');

    const dup = await this.repo.findActiveDuplicate({
      applicantId: dto.applicantId,
      destinationCountry: dto.destinationCountry,
      visaType: dto.visaType
    });
    if (dup) throw new BadRequestException('Duplicate active visa application exists for this applicant, country and visa type');

    const created = await this.repo.createDraft({
      applicantId: dto.applicantId,
      employerId: dto.employerId ?? null,
      jobId: dto.jobId ?? null,
      visaType: dto.visaType,
      destinationCountry: dto.destinationCountry,
      applicationReference: dto.applicationReference ?? null,
      assignedCaseOfficerId: dto.assignedCaseOfficerId ?? null,
      remarks: dto.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: created.id,
      previousStatus: null,
      newStatus: 'DRAFT',
      changedByAdminId: adminUserId,
      changeReason: null
    });

    await this.notifications.statusUpdate(created.id, adminUserId, 'Visa application created as DRAFT');

    return created;
  }

  async updateDraft(visaId: string, adminUserId: string, dto: any) {
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');

    this.status.ensureDraftEditable(visa.status);

    const patch: any = {
      employerId: dto.employerId ?? undefined,
      jobId: dto.jobId ?? undefined,
      visaType: dto.visaType ?? undefined,
      destinationCountry: dto.destinationCountry ?? undefined,
      applicationReference: dto.applicationReference ?? undefined,
      assignedCaseOfficerId: dto.assignedCaseOfficerId ?? undefined,
      remarks: dto.remarks ?? undefined
    };

    const updated = await this.repo.updateDraft(visaId, patch);

    await this.notifications.statusUpdate(visaId, adminUserId, 'Visa application updated');

    return updated;
  }

  async submit(visaId: string, adminUserId: string, dto: any) {
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');

    this.status.ensureCanSubmit(visa.status);

    const documents = await this.docs.listByVisa(visaId);
    const activeByType = new Map<string, any>();
    for (const d of documents) {
      if (!d.isActive) continue;
      if (!activeByType.has(d.documentType)) activeByType.set(d.documentType, d);
    }

    const missing = this.requiredDocs.filter((t) => !activeByType.has(t));
    if (missing.length) throw new BadRequestException(`Missing required documents: ${missing.join(', ')}`);

    const complianceBlocked = await this.compliance.hasBlockingFailures(visaId);
    if (complianceBlocked) throw new BadRequestException('Compliance checks are pending or failed');

    const next = 'SUBMITTED';
    this.status.ensureTransition(visa.status, next);

    await this.repo.setStatus(visaId, next, {
      submittedByAdminId: adminUserId,
      submissionDate: new Date(),
      remarks: dto?.remarks ?? visa.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: visaId,
      previousStatus: visa.status,
      newStatus: next,
      changedByAdminId: adminUserId,
      changeReason: null
    });

    await this.notifications.statusUpdate(visaId, adminUserId, 'Visa application submitted');

    return { ok: true, visaId };
  }

  async updateStatus(visaId: string, adminUserId: string, dto: { status: string; reason?: string }) {
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');

    const next = dto.status;
    this.status.ensureTransition(visa.status, next);

    await this.repo.setStatus(visaId, next, {
      remarks: visa.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: visaId,
      previousStatus: visa.status,
      newStatus: next,
      changedByAdminId: adminUserId,
      changeReason: dto.reason ?? null
    });

    await this.notifications.statusUpdate(visaId, adminUserId, `Visa status updated to ${next}`);

    if (next === 'ADDITIONAL_DOCUMENTS_REQUIRED') {
      await this.notifications.documentRequest(visaId, adminUserId, dto.reason?.trim() ? dto.reason : 'Additional documents required');
    }

    return { ok: true, visaId, status: next };
  }

  async recordDecision(visaId: string, adminUserId: string, dto: any) {
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');

    this.status.ensureCanDecide(visa.status);

    this.status.ensureDecisionPayload(dto.decision, {
      rejectionReason: dto.rejectionReason,
      visaIssueDate: dto.visaIssueDate,
      visaExpiryDate: dto.visaExpiryDate
    });

    if (dto.decision === 'REJECTED') {
      const next = 'REJECTED';
      this.status.ensureTransition(visa.status, next);

      await this.repo.setStatus(visaId, next, {
        decisionDate: new Date(),
        remarks: dto.remarks ?? visa.remarks ?? null
      });

      await this.history.add({
        visaApplicationId: visaId,
        previousStatus: visa.status,
        newStatus: next,
        changedByAdminId: adminUserId,
        changeReason: dto.rejectionReason ?? null
      });

      await this.notifications.decisionRecorded(visaId, adminUserId, `Visa rejected: ${dto.rejectionReason}`);

      return { ok: true, visaId, status: next };
    }

    const next = 'APPROVED';
    this.status.ensureTransition(visa.status, next);

    await this.repo.setStatus(visaId, next, {
      decisionDate: new Date(),
      visaIssueDate: new Date(dto.visaIssueDate),
      visaExpiryDate: new Date(dto.visaExpiryDate),
      remarks: dto.remarks ?? visa.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: visaId,
      previousStatus: visa.status,
      newStatus: next,
      changedByAdminId: adminUserId,
      changeReason: null
    });

    await this.notifications.decisionRecorded(visaId, adminUserId, 'Visa approved');

    return { ok: true, visaId, status: next };
  }

  async list(filters: any, page: number, pageSize: number) {
    return this.repo.list(filters, page, pageSize);
  }

  async get(visaId: string) {
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');
    await this.autoExpireIfNeeded(visa);
    return this.repo.findById(visaId);
  }

  async applicantList(userId: string, status: string | undefined, page: number, pageSize: number) {
    const applicantId = await this.access.getApplicantIdForUser(userId);
    const result = await this.repo.listByApplicant(applicantId, status, page, pageSize);
    await this.autoExpireIfNeededBatch(result.items);
    return result;
  }

  async applicantGet(userId: string, visaId: string) {
    const applicantId = await this.access.getApplicantIdForUser(userId);
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');
    this.access.ensureApplicantCanViewVisa(visa, applicantId);
    await this.autoExpireIfNeeded(visa);
    return this.repo.findById(visaId);
  }

  async agencyList(agencyUserId: string, q: any, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const where: any = { applicant: { createdBy: agencyUserId } };
    if (q?.status) where.status = q.status;
    if (q?.applicantId) where.applicantId = q.applicantId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaApplication.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.visaApplication.count({ where })
    ]);

    await this.autoExpireIfNeededBatch(items);

    return { items, total };
  }

  async agencyGet(agencyUserId: string, visaId: string) {
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');
    this.access.ensureAgencyCanViewVisa(visa, agencyUserId);
    await this.autoExpireIfNeeded(visa);
    return this.repo.findById(visaId);
  }

  async employerList(userId: string, q: any, page: number, pageSize: number) {
    const employer = await this.access.getEmployerForUser(userId);
    const skip = (page - 1) * pageSize;

    const where: any = {
      OR: [{ employerId: employer.id }, { job: { employerId: employer.id } }]
    };
    if (q?.status) where.status = q.status;
    if (q?.applicantId) where.applicantId = q.applicantId;
    if (q?.jobId) where.jobId = q.jobId;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.visaApplication.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.visaApplication.count({ where })
    ]);

    await this.autoExpireIfNeededBatch(items);

    return { items, total };
  }

  async employerGet(userId: string, visaId: string) {
    const employer = await this.access.getEmployerForUser(userId);
    const visa = await this.repo.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');
    this.access.ensureEmployerCanViewVisa(visa, employer.id);
    await this.autoExpireIfNeeded(visa);
    return this.repo.findById(visaId);
  }

  private async autoExpireIfNeeded(visa: any) {
    if (!visa) return;
    if (visa.status !== 'APPROVED') return;
    if (!visa.visaExpiryDate) return;
    const expiry = new Date(visa.visaExpiryDate).getTime();
    if (Number.isNaN(expiry)) return;
    if (expiry > Date.now()) return;

    this.status.ensureTransition('APPROVED', 'EXPIRED');

    await this.repo.setStatus(visa.id, 'EXPIRED', {});

    await this.history.add({
      visaApplicationId: visa.id,
      previousStatus: 'APPROVED',
      newStatus: 'EXPIRED',
      changedByAdminId: null,
      changeReason: 'Auto-expired'
    });

    await this.notifications.expiryAlert(visa.id, null, 'Visa status auto-updated to EXPIRED');
  }

  private async autoExpireIfNeededBatch(items: any[]) {
    const candidates = (items ?? []).filter((v) => v?.status === 'APPROVED' && v?.visaExpiryDate);
    for (const v of candidates) {
      await this.autoExpireIfNeeded(v);
    }
  }
}
