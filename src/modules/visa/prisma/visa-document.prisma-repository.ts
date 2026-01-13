import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { VisaDocumentCreate, VisaDocumentRepository, VisaDocumentVerify } from '../repositories/visa-document.repository';

@Injectable()
export class VisaDocumentPrismaRepository extends VisaDocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async uploadNewVersion(input: VisaDocumentCreate) {
    return this.prisma.$transaction(async (tx) => {
      const latest = await tx.visaDocument.findFirst({
        where: { visaApplicationId: input.visaApplicationId, documentType: input.documentType as any },
        orderBy: { versionNumber: 'desc' }
      });

      if (latest) {
        await tx.visaDocument.updateMany({
          where: { visaApplicationId: input.visaApplicationId, documentType: input.documentType as any, isActive: true },
          data: { isActive: false }
        });
      }

      const versionNumber = latest ? latest.versionNumber + 1 : 1;

      return tx.visaDocument.create({
        data: {
          visaApplicationId: input.visaApplicationId,
          documentType: input.documentType as any,
          fileUrl: input.fileUrl,
          fileHash: input.fileHash ?? null,
          versionNumber,
          isActive: true,
          uploadedByAdminId: input.uploadedByAdminId ?? null,
          verificationStatus: 'PENDING'
        }
      });
    });
  }

  findById(id: string) {
    return this.prisma.visaDocument.findUnique({ where: { id } });
  }

  listByVisa(visaApplicationId: string) {
    return this.prisma.visaDocument.findMany({
      where: { visaApplicationId },
      orderBy: [{ documentType: 'asc' }, { versionNumber: 'desc' }]
    });
  }

  setVerification(id: string, patch: VisaDocumentVerify) {
    return this.prisma.visaDocument.update({
      where: { id },
      data: {
        verificationStatus: patch.verificationStatus as any,
        verificationReason: patch.verificationReason ?? null,
        verifiedByAdminId: patch.verifiedByAdminId ?? null,
        verifiedAt: patch.verifiedAt ?? null
      }
    });
  }
}
