import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import crypto from 'crypto';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class ApplicantReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly profiles: ApplicantProfileRepository,
    private readonly status: ApplicantStatusService,
    private readonly auth: AuthService
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

    await this.prisma.applicantProfile.update({
      where: { applicantId },
      data: {
        profileStatus: 'REJECTED',
        rejectionReason: reason,
        verifiedBy: null,
        verifiedAt: null
      }
    });

    return { ok: true, applicantId };
  }

  async verify(applicantId: string, adminId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant not found');

    this.status.ensureAdminCanVerify(profile.profileStatus);

    if (profile.userId) throw new BadRequestException('User already linked');
    if (!profile.phone) throw new BadRequestException('Applicant phone missing');

    const unusablePasswordHash = crypto.randomBytes(48).toString('base64url');

    const result = await this.prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({ where: { phone: profile.phone } });
      if (existingUser) throw new BadRequestException('User already exists with this phone');

      const user = await tx.user.create({
        data: {
          phone: profile.phone,
          email: profile.email ?? null,
          passwordHash: unusablePasswordHash,
          isActive: true,
          applicantVerified: true
        }
      });

      const role = await tx.role.findUnique({ where: { name: 'APPLICANT' } });
      if (!role) throw new BadRequestException('APPLICANT role missing');

      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });

      await tx.applicantProfile.update({
        where: { applicantId },
        data: {
          userId: user.id,
          profileStatus: 'VERIFIED',
          verifiedBy: adminId,
          verifiedAt: new Date(),
          rejectionReason: null
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } }
      });

      return {
        userId: user.id,
        email: user.email,
        fullName: `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
      };
    });

    if (result.email) {
      await this.auth.sendAccountSetupEmail(result.userId, result.email, result.fullName || 'Applicant');
    }

    return { ok: true, applicantId, userId: result.userId };
  }
}
