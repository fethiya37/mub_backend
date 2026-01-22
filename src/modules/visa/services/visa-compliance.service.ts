import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VisaComplianceRepository } from '../repositories/visa-compliance.repository';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';

@Injectable()
export class VisaComplianceService {
  constructor(
    private readonly visas: VisaApplicationRepository,
    private readonly compliance: VisaComplianceRepository
  ) {}

  async add(visaId: string, createdByAdminId: string, dto: { requirementType: string; remarks?: string }) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');
    if (visa.status === 'WITHDRAWN') throw new BadRequestException('Cannot add compliance check for withdrawn visa');

    const item = await this.compliance.add({
      visaApplicationId: visaId,
      requirementType: dto.requirementType,
      remarks: dto.remarks ?? null,
      createdByAdminId
    });

    return { ok: true, compliance: item };
  }

  async update(checkId: string, checkedByAdminId: string, dto: { requirementStatus: string; remarks?: string }) {
    const item = await this.compliance.findById(checkId);
    if (!item) throw new NotFoundException('Compliance check not found');

    const checkedAt = dto.requirementStatus === 'PENDING' ? null : new Date();

    const updated = await this.compliance.update(checkId, {
      requirementStatus: dto.requirementStatus,
      remarks: dto.remarks ?? null,
      checkedByAdminId,
      checkedAt
    });

    return { ok: true, compliance: updated };
  }

  listByVisa(visaId: string) {
    return this.compliance.listByVisa(visaId);
  }

  async ensureNoBlocking(visaId: string) {
    const blocked = await this.compliance.hasBlockingFailures(visaId);
    if (blocked) throw new BadRequestException('Compliance checks are pending or failed');
  }
}
