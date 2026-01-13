// src/modules/cv/prisma/applicant-cv-section.prisma-repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantCvSectionRepository, CvSectionUpsert } from '../repositories/applicant-cv-section.repository';

@Injectable()
export class ApplicantCvSectionPrismaRepository extends ApplicantCvSectionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async replaceAll(cvId: string, sections: CvSectionUpsert[]) {
    await this.prisma.$transaction(async (tx) => {
      await tx.applicantCvSection.deleteMany({ where: { cvId } });
      if (sections.length) {
        await tx.applicantCvSection.createMany({
          data: sections.map((s) => ({
            cvId,
            sectionName: s.sectionName,
            isEnabled: s.isEnabled,
            displayOrder: s.displayOrder,
            customContent: s.customContent ?? undefined
          }))
        });
      }
    });
  }

  listByCv(cvId: string) {
    return this.prisma.applicantCvSection.findMany({ where: { cvId }, orderBy: { displayOrder: 'asc' } });
  }
}
