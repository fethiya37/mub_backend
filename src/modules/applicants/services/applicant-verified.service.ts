import { BadRequestException, Injectable } from '@nestjs/common';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';

@Injectable()
export class ApplicantVerifiedService {
  constructor(private readonly profiles: ApplicantProfileRepository, private readonly status: ApplicantStatusService) { }

  async getByUserId(userId: string) {
    const profile = await this.profiles.findByUserId(userId);
    if (profile) return profile;
    throw new BadRequestException('Applicant profile not found for user');
  }

  async updateVerified(applicantId: string, dto: any, existingStatus: string) {
    this.status.ensureVerified(existingStatus);

    const patch: any = {
      email: dto.email ?? undefined,
      address: dto.address ?? undefined,
      maritalStatus: dto.maritalStatus ?? undefined,
    };

    if (dto.skills) patch.skills = dto.skills.map((s: any) => ({ ...s }));
    if (dto.qualifications) patch.qualifications = dto.qualifications.map((q: any) => ({ ...q }));
    if (dto.workExperiences)
      patch.workExperiences = dto.workExperiences.map((w: any) => ({
        jobTitle: w.jobTitle,
        country: w.country ?? null,
        yearsWorked: w.yearsWorked ?? null
      }));

    if (dto.documents) patch.documents = dto.documents.map((d: any) => ({ ...d }));

    return this.profiles.updateVerified(applicantId, patch);
  }
}
