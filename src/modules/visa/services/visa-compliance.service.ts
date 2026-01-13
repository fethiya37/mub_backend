import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VisaComplianceRepository } from '../repositories/visa-compliance.repository';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';
import { VisaNotificationsService } from './visa-notifications.service';

@Injectable()
export class VisaComplianceService {
  constructor(
    private readonly visas: VisaApplicationRepository,
    private readonly compliance: VisaComplianceRepository,
    private readonly notifications: VisaNotificationsService
  ) {}

  async add(visaId: string, adminId: string, dto: { requirementType: string; remarks?: string | null }) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');

    if (!['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED'].includes(visa.status)) {
      throw new BadRequestException('Compliance checks cannot be changed in this status');
    }

    return this.compliance.add({
      visaApplicationId: visaId,
      requirementType: dto.requirementType,
      remarks: dto.remarks ?? null,
      createdByAdminId: adminId
    });
  }

  async update(checkId: string, adminId: string, dto: { requirementStatus: string; remarks?: string | null }) {
    const row = await this.compliance.findById(checkId);
    if (!row) throw new NotFoundException('Compliance check not found');

    const patched = await this.compliance.update(checkId, {
      requirementStatus: dto.requirementStatus,
      remarks: dto.remarks ?? null,
      checkedByAdminId: adminId,
      checkedAt: new Date()
    });

    return patched;
  }

  listByVisa(visaId: string) {
    return this.compliance.listByVisa(visaId);
  }

  async ensureSubmittable(visaId: string) {
    const blocking = await this.compliance.hasBlockingFailures(visaId);
    if (blocking) throw new BadRequestException('Compliance is not complete');
  }

  requestAdditionalDocs(visaId: string, adminId: string, message: string) {
    return this.notifications.documentRequest(visaId, adminId, message);
  }
}
