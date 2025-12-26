import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantSkillRepository } from '../repositories/applicant-skill.repository';
import { ApplicantQualificationRepository } from '../repositories/applicant-qualification.repository';
import { ApplicantWorkExperienceRepository } from '../repositories/applicant-work-experience.repository';
import { ApplicantDocumentRepository } from '../repositories/applicant-document.repository';
import { ApplicantStatusService } from './applicant-status.service';
import { AuditService } from '../../audit/services/audit.service';

@Injectable()
export class ApplicantsService {
  constructor(
    private readonly profiles: ApplicantProfileRepository,
    private readonly skills: ApplicantSkillRepository,
    private readonly qualifications: ApplicantQualificationRepository,
    private readonly experiences: ApplicantWorkExperienceRepository,
    private readonly documents: ApplicantDocumentRepository,
    private readonly status: ApplicantStatusService,
    private readonly audit: AuditService
  ) { }

  async createProfile(input: any, performedBy?: string | null) {
    const existing = await this.profiles.findByPhone(input.phone);
    if (existing) throw new ConflictException('Applicant phone already exists');

    const profile = await this.profiles.create({
      phone: input.phone,
      email: input.email ?? null,
      firstName: input.firstName ?? null,
      lastName: input.lastName ?? null,
      gender: input.gender ?? null,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
      nationality: input.nationality ?? null,
      passportNumber: input.passportNumber ?? null,
      address: input.address ?? null,
      maritalStatus: input.maritalStatus ?? null
    });

    await this.audit.log({
      performedBy: performedBy ?? null,
      action: 'APPLICANT_PROFILE_CREATED',
      entityType: 'ApplicantProfile',
      entityId: profile.applicantId
    });

    return profile;
  }

  async getProfile(applicantId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant profile not found');
    return profile;
  }

  async updateProfile(applicantId: string, input: any, performedBy?: string | null) {
    const profile = await this.getProfile(applicantId);
    this.status.ensureCanUpdateProfile(profile.profileStatus);

    const updated = await this.profiles.update(applicantId, {
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      gender: input.gender ?? undefined,
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      nationality: input.nationality ?? undefined,
      passportNumber: input.passportNumber ?? undefined,
      phone: input.phone ?? undefined,
      email: input.email ?? undefined,
      address: input.address ?? undefined,
      maritalStatus: input.maritalStatus ?? undefined
    });

    await this.audit.log({
      performedBy: performedBy ?? null,
      action: 'APPLICANT_PROFILE_UPDATED',
      entityType: 'ApplicantProfile',
      entityId: applicantId
    });

    return updated;
  }

  async submit(applicantId: string, performedBy?: string | null) {
    const profile = await this.getProfile(applicantId);
    this.status.ensureCanSubmit(profile.profileStatus);

    const requiredMissing =
      !profile.firstName ||
      !profile.lastName ||
      !profile.passportNumber ||
      !profile.nationality ||
      !profile.phone;

    if (requiredMissing) throw new BadRequestException('Profile missing required fields');

    const updated = await this.profiles.update(applicantId, {
      profileStatus: 'SUBMITTED',
      submittedAt: new Date(),
      rejectionReason: null
    });

    await this.audit.log({
      performedBy: performedBy ?? null,
      action: 'APPLICANT_PROFILE_SUBMITTED',
      entityType: 'ApplicantProfile',
      entityId: applicantId
    });

    return updated;
  }

  async reject(applicantId: string, reason: string, performedBy: string) {
    const profile = await this.getProfile(applicantId);
    this.status.ensureCanVerifyOrReject(profile.profileStatus);

    const updated = await this.profiles.update(applicantId, {
      profileStatus: 'REJECTED',
      rejectionReason: reason,
      verifiedBy: null,
      verifiedAt: null
    });

    await this.audit.log({
      performedBy,
      action: 'APPLICANT_PROFILE_REJECTED',
      entityType: 'ApplicantProfile',
      entityId: applicantId,
      meta: { reason }
    });

    return updated;
  }

  async listByStatus(status?: string, page = 1, pageSize = 50) {
    if (!status) return this.profiles.listAll(page, pageSize);
    return this.profiles.listByStatus(status, page, pageSize);
  }


  addSkill(applicantId: string, dto: any) {
    return this.skills.add(applicantId, dto);
  }

  updateSkill(skillId: string, dto: any) {
    return this.skills.update(skillId, dto);
  }

  removeSkill(skillId: string) {
    return this.skills.remove(skillId);
  }

  addQualification(applicantId: string, dto: any) {
    return this.qualifications.add(applicantId, dto);
  }

  updateQualification(id: string, dto: any) {
    return this.qualifications.update(id, dto);
  }

  removeQualification(id: string) {
    return this.qualifications.remove(id);
  }

  addWorkExperience(applicantId: string, dto: any) {
    return this.experiences.add(applicantId, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : null,
      endDate: dto.endDate ? new Date(dto.endDate) : null
    });
  }

  updateWorkExperience(id: string, dto: any) {
    return this.experiences.update(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined
    });
  }

  removeWorkExperience(id: string) {
    return this.experiences.remove(id);
  }

  addDocument(applicantId: string, dto: any) {
    return this.documents.add(applicantId, dto);
  }

  updateDocument(id: string, dto: any) {
    return this.documents.update(id, dto);
  }

  removeDocument(id: string) {
    return this.documents.remove(id);
  }
}
