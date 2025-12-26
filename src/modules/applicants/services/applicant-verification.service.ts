import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { PrismaService } from '../../../database/prisma.service';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class ApplicantVerificationService {
  constructor(
    private readonly profiles: ApplicantProfileRepository,
    private readonly users: UserRepository,
    private readonly status: ApplicantStatusService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService
  ) {}

  async verify(applicantId: string, performedBy: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new BadRequestException('Applicant profile not found');

    this.status.ensureCanVerifyOrReject(profile.profileStatus);

    if (profile.userId) throw new BadRequestException('User already created for this applicant');
    if (!profile.phone) throw new BadRequestException('Applicant phone missing');

    const passwordHash = await bcrypt.hash(profile.phone, 12);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          phone: profile.phone,
          email: profile.email ?? null,
          passwordHash,
          isActive: true,
          applicantVerified: true
        }
      });

      const applicantRole = await tx.role.findUnique({ where: { name: 'APPLICANT' } });
      if (!applicantRole) throw new BadRequestException('APPLICANT role missing. Seed roles first.');

      await tx.userRole.create({
        data: { userId: user.id, roleId: applicantRole.id }
      });

      const updatedProfile = await tx.applicantProfile.update({
        where: { applicantId },
        data: {
          userId: user.id,
          profileStatus: 'VERIFIED',
          verifiedBy: performedBy,
          verifiedAt: new Date(),
          rejectionReason: null
        }
      });

      await tx.user.update({
        where: { id: user.id },
        data: { tokenVersion: { increment: 1 } }
      });

      return { user, updatedProfile };
    });

    await this.audit.log({
      performedBy,
      action: 'APPLICANT_PROFILE_VERIFIED',
      entityType: 'ApplicantProfile',
      entityId: applicantId,
      meta: { userId: result.user.id }
    });

    return { ok: true, userId: result.user.id, applicantId };
  }
}
