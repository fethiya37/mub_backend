import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantDocumentRepository } from '../repositories/applicant-document.repository';

@Injectable()
export class ApplicantDocumentPrismaRepository extends ApplicantDocumentRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(applicantId: string, input: any) {
    return this.prisma.applicantDocument.create({
      data: {
        applicantId,
        documentType: input.documentType,
        fileUrl: input.fileUrl,
        verificationStatus: input.verificationStatus ?? null
      }
    });
  }

  update(id: string, input: any) {
    return this.prisma.applicantDocument.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.prisma.applicantDocument.delete({ where: { id } });
  }
}
