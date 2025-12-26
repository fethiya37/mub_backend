import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantWorkExperienceRepository } from '../repositories/applicant-work-experience.repository';

@Injectable()
export class ApplicantWorkExperiencePrismaRepository extends ApplicantWorkExperienceRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(applicantId: string, input: any) {
    return this.prisma.applicantWorkExperience.create({
      data: {
        applicantId,
        jobTitle: input.jobTitle,
        employerName: input.employerName ?? null,
        country: input.country ?? null,
        startDate: input.startDate ?? null,
        endDate: input.endDate ?? null,
        responsibilities: input.responsibilities ?? null
      }
    });
  }

  update(id: string, input: any) {
    return this.prisma.applicantWorkExperience.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.prisma.applicantWorkExperience.delete({ where: { id } });
  }
}
