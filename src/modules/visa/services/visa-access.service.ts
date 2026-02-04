import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class VisaAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async applicantIdForUser(userId: string) {
    const applicant = await this.prisma.applicantProfile.findFirst({
      where: { userId },
      select: { applicantId: true }
    });
    if (!applicant) throw new NotFoundException('Applicant profile not found');
    return applicant.applicantId;
  }

  async employerIdForUser(userId: string) {
    const employer = await this.prisma.employer.findFirst({
      where: { userId },
      select: { id: true, status: true }
    });
    if (!employer) throw new NotFoundException('Employer not found');
    if (employer.status !== 'APPROVED') throw new BadRequestException('Employer not approved');
    return employer.id;
  }
}
