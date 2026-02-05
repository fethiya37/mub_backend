import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantProfileRepository, ApplicantProfileUpsertInput } from '../repositories/applicant-profile.repository';

@Injectable()
export class ApplicantProfilePrismaRepository extends ApplicantProfileRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private includeAll() {
    return {
      skills: { include: { skill: true } },
      qualifications: true,
      workExperiences: true,
      documents: true,
      emergencyContacts: true
    } as const;
  }

  findById(applicantId: string) {
    return this.prisma.applicantProfile.findUnique({
      where: { applicantId },
      include: this.includeAll()
    });
  }

  findByPhone(phone: string) {
    return this.prisma.applicantProfile.findUnique({
      where: { phone },
      include: this.includeAll()
    });
  }

  findByUserId(userId: string) {
    return this.prisma.applicantProfile.findFirst({
      where: { userId },
      include: this.includeAll()
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
        include: this.includeAll()
      });

      const baseData: any = {
        email: input.email ?? undefined,

        firstName: input.firstName ?? undefined,
        middleName: input.middleName ?? undefined,
        lastName: input.lastName ?? undefined,
        gender: input.gender ?? undefined,

        dateOfBirth: input.dateOfBirth ?? undefined,
        placeOfBirth: input.placeOfBirth ?? undefined,
        nationality: input.nationality ?? undefined,
        religion: input.religion ?? undefined,
        maritalStatus: input.maritalStatus ?? undefined,
        numberOfChildren: input.numberOfChildren ?? undefined,

        occupation: input.occupation ?? undefined,

        height: input.height ?? undefined,
        weight: input.weight ?? undefined,

        laborId: input.laborId ?? undefined,

        passportNumber: input.passportNumber ?? undefined,
        passportPlace: input.passportPlace ?? undefined,
        passportIssueDate: input.passportIssueDate ?? undefined,
        passportExpiry: input.passportExpiry ?? undefined,

        address: input.address ?? undefined,

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

            email: input.email ?? undefined,

            applicationNumber: input.applicationNumber ?? this.generateApplicationNumber(),

            firstName: input.firstName ?? null,
            middleName: input.middleName ?? null,
            lastName: input.lastName ?? null,
            gender: input.gender ?? null,

            dateOfBirth: input.dateOfBirth ?? null,
            placeOfBirth: input.placeOfBirth ?? null,
            nationality: input.nationality ?? null,
            religion: input.religion ?? null,
            maritalStatus: input.maritalStatus ?? null,
            numberOfChildren: input.numberOfChildren ?? null,

            occupation: input.occupation ?? null,

            height: input.height ?? null,
            weight: input.weight ?? null,

            laborId: input.laborId ?? null,

            passportNumber: input.passportNumber ?? null,
            passportPlace: input.passportPlace ?? null,
            passportIssueDate: input.passportIssueDate ?? null,
            passportExpiry: input.passportExpiry ?? null,

            address: input.address ?? null,

            registrationSource: input.registrationSource ?? 'SELF',
            createdBy: input.createdBy ?? null,
            profileStatus: 'DRAFT'
          }
        });

      const applicantId = profile.applicantId;

      if (input.emergencyContacts) {
        await tx.emergencyContact.deleteMany({ where: { applicantId } });
        if (input.emergencyContacts.length) {
          await tx.emergencyContact.createMany({
            data: input.emergencyContacts.map((c) => ({
              applicantId,
              fullName: c.fullName,
              phone: c.phone,
              relationship: c.relationship,
              address: c.address ?? null,
              idFileUrl: c.idFileUrl ?? null
            }))
          });
        }
      }

      if (input.skills) {
        await tx.applicantSkill.deleteMany({ where: { applicantId } });
        if (input.skills.length) {
          await tx.applicantSkill.createMany({
            data: input.skills.map((s) => ({
              applicantId,
              skillId: s.skillId,
              hasSkill: s.hasSkill ?? true,
              willingToLearn: s.willingToLearn ?? false
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
              qualification: q.qualification
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
              country: w.country ?? null,
              yearsWorked: w.yearsWorked ?? null
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
              status: d.status ?? null
            }))
          });
        }
      }

      return tx.applicantProfile.findUnique({
        where: { applicantId },
        include: this.includeAll()
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

      if (patch.emergencyContacts) {
        await tx.emergencyContact.deleteMany({ where: { applicantId } });
        if (patch.emergencyContacts.length) {
          await tx.emergencyContact.createMany({
            data: patch.emergencyContacts.map((c: any) => ({
              applicantId,
              fullName: c.fullName,
              phone: c.phone,
              relationship: c.relationship,
              address: c.address ?? null,
              idFileUrl: c.idFileUrl ?? null
            }))
          });
        }
      }

      if (patch.skills) {
        await tx.applicantSkill.deleteMany({ where: { applicantId } });
        if (patch.skills.length) {
          await tx.applicantSkill.createMany({
            data: patch.skills.map((s: any) => ({
              applicantId,
              skillId: s.skillId,
              hasSkill: s.hasSkill ?? true,
              willingToLearn: s.willingToLearn ?? false
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
              qualification: q.qualification
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
              country: w.country ?? null,
              yearsWorked: w.yearsWorked ?? null
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
              status: d.status ?? null
            }))
          });
        }
      }

      return tx.applicantProfile.findUnique({
        where: { applicantId },
        include: this.includeAll()
      });
    });
  }

  private pad(n: number, width: number) {
    return String(n).padStart(width, '0');
  }

  private generateApplicationNumber() {
    const y = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 1_000_000);
    return `MUB-${y}-${this.pad(rand, 6)}`;
  }
}
