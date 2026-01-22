import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class VisaAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicantIdForUser(userId: string) {
    const profile = await this.prisma.applicantProfile.findFirst({ where: { userId }, select: { applicantId: true } });
    if (!profile) throw new NotFoundException('Applicant profile not found for user');
    return profile.applicantId;
  }

  async getEmployerForUser(userId: string) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new NotFoundException('Employer not found for user');
    return employer;
  }

  ensureAgencyCanViewVisa(visa: any, agencyUserId: string) {
    const createdBy = visa?.applicant?.createdBy ?? null;
    if (!createdBy || createdBy !== agencyUserId) throw new ForbiddenException('Not allowed');
  }

  ensureEmployerCanViewVisa(visa: any, employerId: string) {
    const matchByEmployerId = visa?.employerId && visa.employerId === employerId;
    const matchByJobEmployer = visa?.job?.employerId && visa.job.employerId === employerId;
    if (!matchByEmployerId && !matchByJobEmployer) throw new ForbiddenException('Not allowed');
  }

  ensureApplicantCanViewVisa(visa: any, applicantId: string) {
    if (visa?.applicantId !== applicantId) throw new ForbiddenException('Not allowed');
  }
}
