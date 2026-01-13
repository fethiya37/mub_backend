import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VisaDocumentRepository } from '../repositories/visa-document.repository';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';
import { VisaStatusService } from './visa-status.service';
import { VisaNotificationsService } from './visa-notifications.service';

@Injectable()
export class VisaDocumentsService {
  constructor(
    private readonly visas: VisaApplicationRepository,
    private readonly docs: VisaDocumentRepository,
    private readonly status: VisaStatusService,
    private readonly notifications: VisaNotificationsService
  ) {}

  async upload(visaId: string, adminId: string, dto: { documentType: string; fileUrl: string; fileHash?: string | null }) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa application not found');

    if (!['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING'].includes(visa.status)) {
      throw new BadRequestException('Documents cannot be uploaded in this status');
    }

    const doc = await this.docs.uploadNewVersion({
      visaApplicationId: visaId,
      documentType: dto.documentType,
      fileUrl: dto.fileUrl,
      fileHash: dto.fileHash ?? null,
      uploadedByAdminId: adminId
    });

    if (visa.status === 'ADDITIONAL_DOCUMENTS_REQUIRED') {
      await this.notifications.statusUpdate(visaId, adminId, `Document uploaded: ${dto.documentType}`);
    }

    return doc;
  }

  async list(visaId: string) {
    return this.docs.listByVisa(visaId);
  }

  async verify(documentId: string, adminId: string, dto: { verificationStatus: string; reason?: string | null }) {
    const doc = await this.docs.findById(documentId);
    if (!doc) throw new NotFoundException('Visa document not found');

    const patched = await this.docs.setVerification(documentId, {
      verificationStatus: dto.verificationStatus,
      verificationReason: dto.reason ?? null,
      verifiedByAdminId: adminId,
      verifiedAt: new Date()
    });

    return patched;
  }
}
