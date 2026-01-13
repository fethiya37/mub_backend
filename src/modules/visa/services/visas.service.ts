import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantProfileRepository } from '../../applicants/repositories/applicant-profile.repository';
import { EmployerRepository } from '../../employers/repositories/employer.repository';
import { JobPostingRepository } from '../../employers/repositories/job-posting.repository';
import { AuditService } from '../../audit/services/audit.service';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';
import { VisaStatusHistoryRepository } from '../repositories/visa-status-history.repository';
import { VisaStatusService } from './visa-status.service';
import { VisaRulesService } from './visa-rules.service';
import { VisaComplianceService } from './visa-compliance.service';
import { VisaDocumentRepository } from '../repositories/visa-document.repository';
import { VisaNotificationsService } from './visa-notifications.service';

@Injectable()
export class VisasService {
  constructor(
    private readonly applicants: ApplicantProfileRepository,
    private readonly employers: EmployerRepository,
    private readonly jobs: JobPostingRepository,
    private readonly visas: VisaApplicationRepository,
    private readonly docs: VisaDocumentRepository,
    private readonly compliance: VisaComplianceService,
    private readonly status: VisaStatusService,
    private readonly rules: VisaRulesService,
    private readonly history: VisaStatusHistoryRepository,
    private readonly audit: AuditService,
    private readonly notifications: VisaNotificationsService
  ) {}

  async createDraft(adminId: string, dto: any) {
    const applicant = await this.applicants.findById(dto.applicantId);
    if (!applicant) throw new NotFoundException('Applicant not found');
    if (applicant.profileStatus !== 'VERIFIED') throw new BadRequestException('Applicant not verified');

    if (dto.employerId) {
      const employer = await this.employers.findById(dto.employerId);
      if (!employer) throw new BadRequestException('Employer not found');
      if (employer.status !== 'APPROVED') throw new BadRequestException('Employer not approved');
    }

    if (dto.jobId) {
      const job = await this.jobs.findById(dto.jobId);
      if (!job) throw new BadRequestException('Job not found');
    }

    const dup = await this.visas.findActiveDuplicate({
      applicantId: dto.applicantId,
      destinationCountry: dto.destinationCountry,
      visaType: dto.visaType
    });
    if (dup) throw new ConflictException('Duplicate active visa application exists');

    const visa = await this.visas.createDraft({
      applicantId: dto.applicantId,
      employerId: dto.employerId ?? null,
      jobId: dto.jobId ?? null,
      visaType: dto.visaType,
      destinationCountry: dto.destinationCountry,
      applicationReference: dto.applicationReference ?? null,
      assignedCaseOfficerId: dto.assignedCaseOfficerId ?? null,
      remarks: dto.remarks ?? null,
      createdByAdminId: adminId
    });

    await this.history.add({
      visaApplicationId: visa.id,
      previousStatus: null,
      newStatus: 'DRAFT',
      changedByAdminId: adminId,
      changeReason: 'Visa created'
    });

    await this.audit.log({
      performedBy: adminId,
      action: 'VISA_CREATED',
      entityType: 'VisaApplication',
      entityId: visa.id,
      meta: { applicantId: dto.applicantId, destinationCountry: dto.destinationCountry, visaType: dto.visaType }
    });

    return visa;
  }

  async updateDraft(visaId: string, adminId: string, dto: any) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');

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

    const updated = await this.visas.updateDraft(visaId, patch);

    await this.audit.log({
      performedBy: adminId,
      action: 'VISA_UPDATED',
      entityType: 'VisaApplication',
      entityId: visaId
    });

    return updated;
  }

  async submit(visaId: string, adminId: string, dto: any) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');

    this.status.ensureCanSubmit(visa.status);

    const docs = await this.docs.listByVisa(visaId);
    const activeTypes = new Set(docs.filter((d: any) => d.isActive).map((d: any) => d.documentType));
    this.rules.ensureRequiredDocsPresent(activeTypes, visa.destinationCountry);

    await this.compliance.ensureSubmittable(visaId);

    const updated = await this.visas.setStatus(visaId, 'SUBMITTED', {
      submittedByAdminId: adminId,
      submissionDate: new Date(),
      remarks: dto.remarks ?? visa.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: visaId,
      previousStatus: visa.status,
      newStatus: 'SUBMITTED',
      changedByAdminId: adminId,
      changeReason: 'Submitted'
    });

    await this.notifications.statusUpdate(visaId, adminId, 'Visa submitted');

    await this.audit.log({
      performedBy: adminId,
      action: 'VISA_SUBMITTED',
      entityType: 'VisaApplication',
      entityId: visaId
    });

    return updated;
  }

  async updateStatus(visaId: string, adminId: string, dto: { status: string; reason?: string | null }) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');

    this.status.ensureTransition(visa.status, dto.status);

    const patched = await this.visas.setStatus(visaId, dto.status, {
      remarks: visa.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: visaId,
      previousStatus: visa.status,
      newStatus: dto.status,
      changedByAdminId: adminId,
      changeReason: dto.reason ?? null
    });

    if (dto.status === 'ADDITIONAL_DOCUMENTS_REQUIRED') {
      await this.notifications.documentRequest(visaId, adminId, dto.reason ?? 'Additional documents required');
    } else {
      await this.notifications.statusUpdate(visaId, adminId, `Visa status updated to ${dto.status}`);
    }

    await this.audit.log({
      performedBy: adminId,
      action: 'VISA_STATUS_UPDATED',
      entityType: 'VisaApplication',
      entityId: visaId,
      meta: { status: dto.status, reason: dto.reason ?? null }
    });

    return patched;
  }

  async recordDecision(visaId: string, adminId: string, dto: any) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');

    this.status.ensureDecisionAllowed(visa.status);

    if (dto.decision === 'REJECTED') {
      const reason = (dto.rejectionReason ?? '').trim();
      if (!reason) throw new BadRequestException('Rejection reason is required');

      this.status.ensureTransition(visa.status, 'REJECTED');

      const patched = await this.visas.setStatus(visaId, 'REJECTED', {
        decisionDate: new Date(),
        remarks: dto.remarks ?? visa.remarks ?? null
      });

      await this.history.add({
        visaApplicationId: visaId,
        previousStatus: visa.status,
        newStatus: 'REJECTED',
        changedByAdminId: adminId,
        changeReason: reason
      });

      await this.notifications.decisionRecorded(visaId, adminId, `Visa rejected: ${reason}`);

      await this.audit.log({
        performedBy: adminId,
        action: 'VISA_REJECTED',
        entityType: 'VisaApplication',
        entityId: visaId,
        meta: { reason }
      });

      return patched;
    }

    const issue = dto.visaIssueDate ? new Date(dto.visaIssueDate) : null;
    const expiry = dto.visaExpiryDate ? new Date(dto.visaExpiryDate) : null;
    this.rules.ensureApprovedDates(issue, expiry);

    this.status.ensureTransition(visa.status, 'APPROVED');

    const patched = await this.visas.setStatus(visaId, 'APPROVED', {
      decisionDate: new Date(),
      visaIssueDate: issue,
      visaExpiryDate: expiry,
      remarks: dto.remarks ?? visa.remarks ?? null
    });

    await this.history.add({
      visaApplicationId: visaId,
      previousStatus: visa.status,
      newStatus: 'APPROVED',
      changedByAdminId: adminId,
      changeReason: 'Approved'
    });

    await this.notifications.decisionRecorded(visaId, adminId, 'Visa approved');

    await this.audit.log({
      performedBy: adminId,
      action: 'VISA_APPROVED',
      entityType: 'VisaApplication',
      entityId: visaId,
      meta: { visaIssueDate: issue?.toISOString() ?? null, visaExpiryDate: expiry?.toISOString() ?? null }
    });

    return patched;
  }

  list(filters: any, page: number, pageSize: number) {
    return this.visas.list(filters, page, pageSize);
  }

  async get(visaId: string) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');
    return visa;
  }

  async applicantList(applicantId: string, status: string | undefined, page: number, pageSize: number) {
    return this.visas.listByApplicant(applicantId, status, page, pageSize);
  }

  async applicantGet(applicantId: string, visaId: string) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');
    if (visa.applicantId !== applicantId) throw new BadRequestException('Not allowed');
    this.status.ensureApplicantReadable(visa.status);
    return visa;
  }
}
