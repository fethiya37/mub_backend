import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';

@Injectable()
export class CvAccessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cvs: ApplicantCvRepository
  ) {}

  async getApplicantIdForUser(userId: string) {
    const profile = await this.prisma.applicantProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundException('Applicant profile not found for user');
    return profile.applicantId as string;
  }

  async assertCvOwnedByUser(userId: string, cvId: string) {
    const applicantId = await this.getApplicantIdForUser(userId);
    const cv = await this.cvs.findById(cvId);
    if (!cv) throw new NotFoundException('CV not found');
    if (cv.applicantId !== applicantId) throw new ForbiddenException('Not allowed');
    return { applicantId, cv };
  }

  async getCv(cvId: string) {
    const cv = await this.cvs.findById(cvId);
    if (!cv) throw new NotFoundException('CV not found');
    return cv;
  }

  async listApplicantCvs(
    filters: { applicantId: string; status?: string; jobId?: string },
    page: number,
    pageSize: number
  ) {
    return this.cvs.listForApplicant(
      { applicantId: filters.applicantId, status: filters.status, jobId: filters.jobId },
      page,
      pageSize
    );
  }

  async ensureApplicantVerified(applicantId: string) {
    const profile = await this.prisma.applicantProfile.findUnique({ where: { applicantId } });
    if (!profile) throw new NotFoundException('Applicant profile not found');
    if (profile.profileStatus !== 'VERIFIED') throw new BadRequestException('Applicant profile must be VERIFIED');
    return profile;
  }
}
