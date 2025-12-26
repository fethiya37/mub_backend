import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantQualificationRepository } from '../repositories/applicant-qualification.repository';

@Injectable()
export class ApplicantQualificationPrismaRepository extends ApplicantQualificationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(applicantId: string, input: any) {
    return this.prisma.applicantQualification.create({
      data: {
        applicantId,
        qualificationType: input.qualificationType,
        institution: input.institution ?? null,
        country: input.country ?? null,
        yearCompleted: input.yearCompleted ?? null
      }
    });
  }

  update(id: string, input: any) {
    return this.prisma.applicantQualification.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.prisma.applicantQualification.delete({ where: { id } });
  }
}
