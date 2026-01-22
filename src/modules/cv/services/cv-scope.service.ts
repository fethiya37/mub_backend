import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class CvScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async assertApplicantBelongsToAgency(applicantId: string, agencyUserId: string) {
    const profile = await this.prisma.applicantProfile.findUnique({
      where: { applicantId },
      select: { applicantId: true, registrationSource: true, createdBy: true }
    });

    if (!profile) throw new NotFoundException('Applicant profile not found');

    const isAgencyOwned =
      profile.registrationSource === 'AGENCY' && profile.createdBy && profile.createdBy === agencyUserId;

    if (!isAgencyOwned) throw new ForbiddenException('Applicant does not belong to this agency');

    return profile;
  }
}
