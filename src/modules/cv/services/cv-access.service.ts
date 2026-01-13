// src/modules/cv/services/cv-access.service.ts
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantVerifiedService } from '../../applicants/services/applicant-verified.service';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';

@Injectable()
export class CvAccessService {
  constructor(
    private readonly verified: ApplicantVerifiedService,
    private readonly cvs: ApplicantCvRepository
  ) {}

  async getApplicantIdForUser(userId: string) {
    const profile = await this.verified.getByUserId(userId);
    return profile.applicantId as string;
  }

  async getCvOwnedByUser(userId: string, cvId: string) {
    const applicantId = await this.getApplicantIdForUser(userId);
    const cv = await this.cvs.findById(cvId);
    if (!cv) throw new NotFoundException('CV not found');
    if (cv.applicantId !== applicantId) throw new ForbiddenException('Not allowed');
    return { applicantId, cv };
  }
}
