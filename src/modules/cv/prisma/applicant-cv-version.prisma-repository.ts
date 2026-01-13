// src/modules/cv/prisma/applicant-cv-version.prisma-repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantCvVersionRepository, CvVersionCreate } from '../repositories/applicant-cv-version.repository';

@Injectable()
export class ApplicantCvVersionPrismaRepository extends ApplicantCvVersionRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: CvVersionCreate) {
    return this.prisma.applicantCvVersion.create({ data: input as any });
  }

  listByCv(cvId: string) {
    return this.prisma.applicantCvVersion.findMany({
      where: { cvId },
      orderBy: { versionNumber: 'desc' }
    });
  }

  listByApplicant(applicantId: string) {
    return this.prisma.applicantCvVersion.findMany({
      where: { cv: { applicantId } },
      orderBy: { createdAt: 'desc' }
    });
  }

  findById(id: string) {
    return this.prisma.applicantCvVersion.findUnique({ where: { id }, include: { cv: true } });
  }
}
