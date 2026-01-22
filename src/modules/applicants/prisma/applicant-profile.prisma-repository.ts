import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantProfileRepository, ApplicantProfileUpsertInput } from '../repositories/applicant-profile.repository';

@Injectable()
export class ApplicantProfilePrismaRepository extends ApplicantProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  findById(applicantId: string) {
    return this.prisma.applicantProfile.findUnique({
      where: { applicantId },
      include: { skills: true, qualifications: true, workExperiences: true, documents: true }
    });
  }

  findByPhone(phone: string) {
    return this.prisma.applicantProfile.findUnique({
      where: { phone },
      include: { skills: true, qualifications: true, workExperiences: true, documents: true }
    });
  }

  findByUserId(userId: string) {
    return this.prisma.applicantProfile.findFirst({
      where: { userId },
      include: { skills: true, qualifications: true, workExperiences: true, documents: true }
    });
  }

  async listByStatus(status: string | undefined, createdBy: string | undefined, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (status) where.profileStatus = status;
    if (createdBy) where.createdBy = createdBy;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.applicantProfile.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      this.prisma.applicantProfile.count({ where })
    ]);

    return { items, total };
  }

  async listByCreator(createdBy: string, status: string | undefined, page: number, pageSize: number) {
    return this.listByStatus(status, createdBy, page, pageSize);
  }

  async upsertDraft(input: ApplicantProfileUpsertInput) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.applicantProfile.findUnique({
        where: { phone: input.phone },
        include: { skills: true, qualifications: true, workExperiences: true, documents: true }
      });

      const baseData: any = {
        email: input.email ?? undefined,
        firstName: input.firstName ?? undefined,
        lastName: input.lastName ?? undefined,
        gender: input.gender ?? undefined,
        dateOfBirth: input.dateOfBirth ?? undefined,
        nationality: input.nationality ?? undefined,
        region: input.region ?? undefined,
        passportNumber: input.passportNumber ?? undefined,
        passportExpiry: input.passportExpiry ?? undefined,
        laborId: input.laborId ?? undefined,
        address: input.address ?? undefined,
        maritalStatus: input.maritalStatus ?? undefined,
        visaNumber: input.visaNumber ?? undefined,
        applicationNumber: input.applicationNumber ?? undefined,
        barcodeValue: input.barcodeValue ?? undefined,
        registrationSource: input.registrationSource ?? undefined,
        createdBy: input.createdBy ?? undefined
      };

      const profile = existing
        ? await tx.applicantProfile.update({
            where: { applicantId: existing.applicantId },
            data: baseData
          })
        : await tx.applicantProfile.create({
            data: {
              phone: input.phone,
              email: input.email ?? null,
              firstName: input.firstName ?? null,
              lastName: input.lastName ?? null,
              gender: input.gender ?? null,
              dateOfBirth: input.dateOfBirth ?? null,
              nationality: input.nationality ?? null,
              region: input.region ?? null,
              passportNumber: input.passportNumber ?? null,
              passportExpiry: input.passportExpiry ?? null,
              laborId: input.laborId ?? null,
              address: input.address ?? null,
              maritalStatus: input.maritalStatus ?? null,
              visaNumber: input.visaNumber ?? null,
              applicationNumber: input.applicationNumber ?? null,
              barcodeValue: input.barcodeValue ?? null,
              registrationSource: input.registrationSource ?? 'SELF',
              createdBy: input.createdBy ?? null,
              profileStatus: 'DRAFT'
            }
          });

      const applicantId = profile.applicantId;

      if (input.skills) {
        await tx.applicantSkill.deleteMany({ where: { applicantId } });
        if (input.skills.length) {
          await tx.applicantSkill.createMany({
            data: input.skills.map((s) => ({
              applicantId,
              skillName: s.skillName,
              proficiencyLevel: s.proficiencyLevel ?? null,
              yearsOfExperience: s.yearsOfExperience ?? null
            }))
          });
        }
      }

      if (input.qualifications) {
        await tx.applicantQualification.deleteMany({ where: { applicantId } });
        if (input.qualifications.length) {
          await tx.applicantQualification.createMany({
            data: input.qualifications.map((q) => ({
              applicantId,
              qualificationType: q.qualificationType,
              institution: q.institution ?? null,
              country: q.country ?? null,
              yearCompleted: q.yearCompleted ?? null
            }))
          });
        }
      }

      if (input.workExperiences) {
        await tx.applicantWorkExperience.deleteMany({ where: { applicantId } });
        if (input.workExperiences.length) {
          await tx.applicantWorkExperience.createMany({
            data: input.workExperiences.map((w) => ({
              applicantId,
              jobTitle: w.jobTitle,
              employerName: w.employerName ?? null,
              country: w.country ?? null,
              startDate: w.startDate ?? null,
              endDate: w.endDate ?? null,
              responsibilities: w.responsibilities ?? null
            }))
          });
        }
      }

      if (input.documents) {
        await tx.applicantDocument.deleteMany({ where: { applicantId } });
        if (input.documents.length) {
          await tx.applicantDocument.createMany({
            data: input.documents.map((d) => ({
              applicantId,
              documentType: d.documentType,
              fileUrl: d.fileUrl,
              verificationStatus: d.verificationStatus ?? null
            }))
          });
        }
      }

      return tx.applicantProfile.findUnique({
        where: { applicantId },
        include: { skills: true, qualifications: true, workExperiences: true, documents: true }
      });
    });
  }

  setStatus(applicantId: string, status: any, patch: any) {
    return this.prisma.applicantProfile.update({
      where: { applicantId },
      data: { profileStatus: status, ...patch }
    });
  }

  linkUser(applicantId: string, userId: string, verifiedBy: string) {
    return this.prisma.applicantProfile.update({
      where: { applicantId },
      data: {
        userId,
        profileStatus: 'VERIFIED',
        verifiedBy,
        verifiedAt: new Date(),
        rejectionReason: null
      }
    });
  }

  async updateVerified(applicantId: string, patch: any) {
    return this.prisma.$transaction(async (tx) => {
      await tx.applicantProfile.update({ where: { applicantId }, data: patch });

      if (patch.skills) {
        await tx.applicantSkill.deleteMany({ where: { applicantId } });
        if (patch.skills.length) {
          await tx.applicantSkill.createMany({
            data: patch.skills.map((s: any) => ({
              applicantId,
              skillName: s.skillName,
              proficiencyLevel: s.proficiencyLevel ?? null,
              yearsOfExperience: s.yearsOfExperience ?? null
            }))
          });
        }
      }

      if (patch.qualifications) {
        await tx.applicantQualification.deleteMany({ where: { applicantId } });
        if (patch.qualifications.length) {
          await tx.applicantQualification.createMany({
            data: patch.qualifications.map((q: any) => ({
              applicantId,
              qualificationType: q.qualificationType,
              institution: q.institution ?? null,
              country: q.country ?? null,
              yearCompleted: q.yearCompleted ?? null
            }))
          });
        }
      }

      if (patch.workExperiences) {
        await tx.applicantWorkExperience.deleteMany({ where: { applicantId } });
        if (patch.workExperiences.length) {
          await tx.applicantWorkExperience.createMany({
            data: patch.workExperiences.map((w: any) => ({
              applicantId,
              jobTitle: w.jobTitle,
              employerName: w.employerName ?? null,
              country: w.country ?? null,
              startDate: w.startDate ?? null,
              endDate: w.endDate ?? null,
              responsibilities: w.responsibilities ?? null
            }))
          });
        }
      }

      if (patch.documents) {
        await tx.applicantDocument.deleteMany({ where: { applicantId } });
        if (patch.documents.length) {
          await tx.applicantDocument.createMany({
            data: patch.documents.map((d: any) => ({
              applicantId,
              documentType: d.documentType,
              fileUrl: d.fileUrl,
              verificationStatus: d.verificationStatus ?? null
            }))
          });
        }
      }

      return tx.applicantProfile.findUnique({
        where: { applicantId },
        include: { skills: true, qualifications: true, workExperiences: true, documents: true }
      });
    });
  }
}
