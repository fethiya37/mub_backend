import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantProfileCreateInput, ApplicantProfileRepository, ApplicantProfileUpdateInput } from '../repositories/applicant-profile.repository';

@Injectable()
export class ApplicantProfilePrismaRepository extends ApplicantProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: ApplicantProfileCreateInput) {
    return this.prisma.applicantProfile.create({
      data: {
        phone: input.phone,
        email: input.email ?? null,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        gender: input.gender ?? null,
        dateOfBirth: input.dateOfBirth ?? null,
        nationality: input.nationality ?? null,
        passportNumber: input.passportNumber ?? null,
        address: input.address ?? null,
        maritalStatus: input.maritalStatus ?? null
      }
    });
  }

  findById(applicantId: string) {
    return this.prisma.applicantProfile.findUnique({
      where: { applicantId },
      include: { skills: true, qualifications: true, workExperiences: true, documents: true }
    });
  }

  findByPhone(phone: string) {
    return this.prisma.applicantProfile.findFirst({ where: { phone } });
  }

  async listAll(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantProfile.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.applicantProfile.count()
    ]);

    return { items, total };
  }

  async listByStatus(status: string, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantProfile.findMany({
        where: { profileStatus: status as any },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.applicantProfile.count({ where: { profileStatus: status as any } })
    ]);
    return { items, total };
  }

  update(applicantId: string, input: ApplicantProfileUpdateInput) {
    return this.prisma.applicantProfile.update({
      where: { applicantId },
      data: input
    });
  }
}
