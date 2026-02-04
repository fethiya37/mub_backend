import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';
import { ApplicantDraftTokenService } from './applicant-draft-token.service';

@Injectable()
export class ApplicantsService {
  constructor(
    private readonly profiles: ApplicantProfileRepository,
    private readonly status: ApplicantStatusService,
    private readonly draftTokens: ApplicantDraftTokenService
  ) {}

  async draftUpsert(dto: any) {
    const existing = await this.profiles.findByPhone(dto.phone);
    if (existing) this.status.ensureDraftEditable(existing.profileStatus);

    this.draftTokens.parseLaborId(dto.gender ?? null, dto.laborId ?? null);

    const passportExpiry = dto.passportExpiry ? new Date(dto.passportExpiry) : null;
    this.draftTokens.ensurePassportExpiry(passportExpiry);

    const passportIssueDate = dto.passportIssueDate ? new Date(dto.passportIssueDate) : null;

    const profile = await this.profiles.upsertDraft({
      phone: dto.phone,
      email: dto.email ?? null,

      firstName: dto.firstName ?? null,
      middleName: dto.middleName ?? null,
      lastName: dto.lastName ?? null,
      gender: dto.gender ?? null,

      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      placeOfBirth: dto.placeOfBirth ?? null,
      nationality: dto.nationality ?? null,
      religion: dto.religion ?? null,
      maritalStatus: dto.maritalStatus ?? null,
      numberOfChildren: dto.numberOfChildren ?? null,

      height: dto.height ?? null,
      weight: dto.weight ?? null,

      laborId: dto.laborId ?? null,

      passportNumber: dto.passportNumber ?? null,
      passportPlace: dto.passportPlace ?? null,
      passportIssueDate,
      passportExpiry,

      address: dto.address ?? null,

      registrationSource: 'SELF',
      createdBy: null,

      emergencyContacts: dto.emergencyContacts ? dto.emergencyContacts.map((c: any) => ({ ...c })) : undefined,
      skills: dto.skills ? dto.skills.map((s: any) => ({ ...s })) : undefined,
      qualifications: dto.qualifications ? dto.qualifications.map((q: any) => ({ ...q })) : undefined,
      workExperiences: dto.workExperiences
        ? dto.workExperiences.map((w: any) => ({
            jobTitle: w.jobTitle,
            country: w.country ?? null,
            yearsWorked: w.yearsWorked ?? null
          }))
        : undefined,
      documents: dto.documents ? dto.documents.map((d: any) => ({ ...d })) : undefined
    });

    const token = await this.draftTokens.rotate(profile.applicantId);
    return { applicantId: profile.applicantId, ...token };
  }

  async agentDraftUpsert(agentUserId: string, dto: any) {
    const existing = await this.profiles.findByPhone(dto.phone);
    if (existing) this.status.ensureDraftEditable(existing.profileStatus);

    this.draftTokens.parseLaborId(dto.gender ?? null, dto.laborId ?? null);

    const passportExpiry = dto.passportExpiry ? new Date(dto.passportExpiry) : null;
    this.draftTokens.ensurePassportExpiry(passportExpiry);

    const passportIssueDate = dto.passportIssueDate ? new Date(dto.passportIssueDate) : null;

    const profile = await this.profiles.upsertDraft({
      phone: dto.phone,
      email: dto.email ?? null,

      firstName: dto.firstName ?? null,
      middleName: dto.middleName ?? null,
      lastName: dto.lastName ?? null,
      gender: dto.gender ?? null,

      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
      placeOfBirth: dto.placeOfBirth ?? null,
      nationality: dto.nationality ?? null,
      religion: dto.religion ?? null,
      maritalStatus: dto.maritalStatus ?? null,
      numberOfChildren: dto.numberOfChildren ?? null,

      height: dto.height ?? null,
      weight: dto.weight ?? null,

      laborId: dto.laborId ?? null,

      passportNumber: dto.passportNumber ?? null,
      passportPlace: dto.passportPlace ?? null,
      passportIssueDate,
      passportExpiry,

      address: dto.address ?? null,

      registrationSource: 'AGENCY',
      createdBy: agentUserId,

      emergencyContacts: dto.emergencyContacts ? dto.emergencyContacts.map((c: any) => ({ ...c })) : undefined,
      skills: dto.skills ? dto.skills.map((s: any) => ({ ...s })) : undefined,
      qualifications: dto.qualifications ? dto.qualifications.map((q: any) => ({ ...q })) : undefined,
      workExperiences: dto.workExperiences
        ? dto.workExperiences.map((w: any) => ({
            jobTitle: w.jobTitle,
            country: w.country ?? null,
            yearsWorked: w.yearsWorked ?? null
          }))
        : undefined,
      documents: dto.documents ? dto.documents.map((d: any) => ({ ...d })) : undefined
    });

    return { ok: true, applicantId: profile.applicantId };
  }

  async issueDraftToken(phone: string, passportNumber?: string) {
    const profile = await this.profiles.findByPhone(phone);
    if (!profile) throw new BadRequestException('Applicant not found');
    this.status.ensureDraftEditable(profile.profileStatus);

    if (passportNumber) {
      const match = (profile.passportNumber ?? '').trim() === passportNumber.trim();
      if (!match) throw new ConflictException('Passport number mismatch');
    }

    const token = await this.draftTokens.rotate(profile.applicantId);
    return { applicantId: profile.applicantId, ...token };
  }

  async getDraft(applicantId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new BadRequestException('Applicant not found');
    this.status.ensureDraftEditable(profile.profileStatus);
    return profile;
  }

  async draftUpdate(applicantId: string, dto: any) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new BadRequestException('Applicant not found');
    this.status.ensureDraftEditable(profile.profileStatus);

    const merged = {
      phone: profile.phone,
      email: dto.email ?? profile.email,

      firstName: dto.firstName ?? profile.firstName,
      middleName: dto.middleName ?? profile.middleName,
      lastName: dto.lastName ?? profile.lastName,
      gender: dto.gender ?? profile.gender,

      dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : profile.dateOfBirth,
      placeOfBirth: dto.placeOfBirth ?? profile.placeOfBirth,
      nationality: dto.nationality ?? profile.nationality,
      religion: dto.religion ?? profile.religion,
      maritalStatus: dto.maritalStatus ?? profile.maritalStatus,
      numberOfChildren: dto.numberOfChildren ?? profile.numberOfChildren,

      height: dto.height ?? profile.height,
      weight: dto.weight ?? profile.weight,

      laborId: dto.laborId ?? profile.laborId,

      passportNumber: dto.passportNumber ?? profile.passportNumber,
      passportPlace: dto.passportPlace ?? profile.passportPlace,
      passportIssueDate: dto.passportIssueDate ? new Date(dto.passportIssueDate) : profile.passportIssueDate,
      passportExpiry: dto.passportExpiry ? new Date(dto.passportExpiry) : profile.passportExpiry,

      address: dto.address ?? profile.address,

      registrationSource: profile.registrationSource ?? 'SELF',
      createdBy: profile.createdBy ?? null,

      emergencyContacts: dto.emergencyContacts ? dto.emergencyContacts.map((c: any) => ({ ...c })) : undefined,
      skills: dto.skills ? dto.skills.map((s: any) => ({ ...s })) : undefined,
      qualifications: dto.qualifications ? dto.qualifications.map((q: any) => ({ ...q })) : undefined,
      workExperiences: dto.workExperiences
        ? dto.workExperiences.map((w: any) => ({
            jobTitle: w.jobTitle,
            country: w.country ?? null,
            yearsWorked: w.yearsWorked ?? null
          }))
        : undefined,
      documents: dto.documents ? dto.documents.map((d: any) => ({ ...d })) : undefined
    };

    this.draftTokens.parseLaborId(merged.gender ?? null, merged.laborId ?? null);
    this.draftTokens.ensurePassportExpiry(merged.passportExpiry ?? null);

    await this.profiles.upsertDraft(merged as any);

    const token = await this.draftTokens.rotate(applicantId);
    return { ok: true, ...token };
  }

  async submit(applicantId: string, draftTokenRecordId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new BadRequestException('Applicant not found');
    this.status.ensureCanSubmit(profile.profileStatus);

    const missingProfile =
      !profile.firstName ||
      !profile.lastName ||
      !profile.gender ||
      !profile.dateOfBirth ||
      !profile.placeOfBirth ||
      !profile.nationality ||
      !profile.maritalStatus ||
      !profile.passportNumber ||
      !profile.passportPlace ||
      !profile.passportIssueDate ||
      !profile.passportExpiry ||
      !profile.laborId ||
      !profile.phone;

    if (missingProfile) throw new BadRequestException('Missing required profile fields');

    this.draftTokens.parseLaborId(profile.gender ?? null, profile.laborId ?? null);
    this.draftTokens.ensurePassportExpiry(profile.passportExpiry ?? null);

    const docTypes = new Set((profile.documents ?? []).map((d: any) => d.documentType));
    const requiredDocs = ['PASSPORT', 'PERSONAL_PHOTO', 'COC_CERTIFICATE'];
    const missingDocs = requiredDocs.filter((t) => !docTypes.has(t));
    if (missingDocs.length) throw new BadRequestException(`Missing required documents: ${missingDocs.join(', ')}`);

    await this.profiles.setStatus(applicantId, 'SUBMITTED', { submittedAt: new Date(), rejectionReason: null });
    await this.draftTokens.markUsed(draftTokenRecordId);

    return { ok: true, applicantId };
  }

  async agentList(agentUserId: string, status: string | undefined, page: number, pageSize: number) {
    return this.profiles.listByCreator(agentUserId, status, page, pageSize);
  }

  async agentSubmit(agentUserId: string, applicantId: string) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant not found');
    if (profile.createdBy !== agentUserId) throw new ForbiddenException('Not allowed');

    this.status.ensureCanSubmit(profile.profileStatus);

    const missingProfile =
      !profile.firstName ||
      !profile.lastName ||
      !profile.gender ||
      !profile.dateOfBirth ||
      !profile.placeOfBirth ||
      !profile.nationality ||
      !profile.maritalStatus ||
      !profile.passportNumber ||
      !profile.passportPlace ||
      !profile.passportIssueDate ||
      !profile.passportExpiry ||
      !profile.laborId ||
      !profile.phone;

    if (missingProfile) throw new BadRequestException('Missing required profile fields');

    this.draftTokens.parseLaborId(profile.gender ?? null, profile.laborId ?? null);
    this.draftTokens.ensurePassportExpiry(profile.passportExpiry ?? null);

    const docTypes = new Set((profile.documents ?? []).map((d: any) => d.documentType));
    const requiredDocs = ['PASSPORT', 'PERSONAL_PHOTO', 'COC_CERTIFICATE'];
    const missingDocs = requiredDocs.filter((t) => !docTypes.has(t));
    if (missingDocs.length) throw new BadRequestException(`Missing required documents: ${missingDocs.join(', ')}`);

    await this.profiles.setStatus(applicantId, 'SUBMITTED', { submittedAt: new Date(), rejectionReason: null });

    return { ok: true, applicantId };
  }
}
