import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { VisaDocumentRepository } from '../repositories/visa-document.repository';
import { VisaApplicationRepository } from '../repositories/visa-application.repository';

@Injectable()
export class VisaDocumentsService {
  constructor(
    private readonly visas: VisaApplicationRepository,
    private readonly docs: VisaDocumentRepository
  ) {}

  async upload(visaId: string, uploadedByAdminId: string, dto: { documentType: string; fileUrl: string; fileHash?: string }) {
    const visa = await this.visas.findById(visaId);
    if (!visa) throw new NotFoundException('Visa not found');
    if (visa.status === 'WITHDRAWN') throw new BadRequestException('Cannot upload document for withdrawn visa');
    if (visa.status === 'EXPIRED') throw new BadRequestException('Cannot upload document for expired visa');

    const doc = await this.docs.uploadNewVersion({
      visaApplicationId: visaId,
      documentType: dto.documentType,
      fileUrl: dto.fileUrl,
      fileHash: dto.fileHash ?? null,
      uploadedByAdminId
    });

    return { ok: true, document: doc };
  }

  async verify(documentId: string, verifiedByAdminId: string, dto: { verificationStatus: string; reason?: string }) {
    const doc = await this.docs.findById(documentId);
    if (!doc) throw new NotFoundException('Document not found');

    if (dto.verificationStatus === 'REJECTED' && (!dto.reason || dto.reason.trim().length < 2)) {
      throw new BadRequestException('reason is required when rejecting a document');
    }

    const updated = await this.docs.setVerification(documentId, {
      verificationStatus: dto.verificationStatus,
      verificationReason: dto.reason ?? null,
      verifiedByAdminId,
      verifiedAt: new Date()
    });

    return { ok: true, document: updated };
  }

  list(visaId: string) {
    return this.docs.listByVisa(visaId);
  }
}
