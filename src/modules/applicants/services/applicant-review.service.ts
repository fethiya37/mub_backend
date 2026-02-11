import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';

@Injectable()
export class ApplicantReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ApplicantProfileRepository,
    private readonly status: ApplicantStatusService
  ) {}

  async list(status: string | undefined, createdBy: string | undefined, page = 1, pageSize = 50) {
    return this.profiles.listByStatus(status, createdBy, page, pageSize);
  }

  async get(applicantId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant not found');
    return profile;
  }

  async reject(applicantId: string, adminId: string, reason: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant not found');

    this.status.ensureAdminCanReject(profile.profileStatus);

    await this.prisma.$transaction(async (tx) => {
      await tx.applicantProfile.update({
        where: { applicantId },
        data: {
          profileStatus: 'REJECTED',
          rejectionReason: reason,
          verifiedBy: null,
          verifiedAt: null
        }
      });

      if (profile.userId) {
        await tx.user.update({
          where: { id: profile.userId },
          data: { status: 'REJECTED', applicantVerified: false }
        });
      }
    });

    return { ok: true, applicantId };
  }

  async verify(applicantId: string, adminId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant not found');

    this.status.ensureAdminCanVerify(profile.profileStatus);

    if (!profile.userId) throw new BadRequestException('Applicant user not created yet. Submit with password first.');

    await this.prisma.$transaction(async (tx) => {
      await tx.applicantProfile.update({
        where: { applicantId },
        data: {
          profileStatus: 'VERIFIED',
          verifiedBy: adminId,
          verifiedAt: new Date(),
          rejectionReason: null
        }
      });

      await tx.user.update({
        where: { id: profile.userId },
        data: { status: 'APPROVED', applicantVerified: true }
      });
    });

    return { ok: true, applicantId, userId: profile.userId };
  }
}
