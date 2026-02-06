import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';
import { ApplicantDraftTokenService } from './applicant-draft-token.service';
import { safeDeleteUploadByRelativePath } from '../../../common/utils/upload/upload.utils';

type FileUrlsMap = Record<string, string>;

@Injectable()
export class ApplicantsService {
  constructor(
    private readonly profiles: ApplicantProfileRepository,
    private readonly status: ApplicantStatusService,
    private readonly draftTokens: ApplicantDraftTokenService
  ) {}

  private ensureArray<T>(v: any): T[] {
    if (!v) return [];
    return Array.isArray(v) ? (v as T[]) : [];
  }

  private upsertDoc(docs: any[], documentType: string, fileUrl: string) {
    const idx = docs.findIndex((d) => String(d?.documentType) === documentType);
    if (idx >= 0) {
      docs[idx] = { ...docs[idx], fileUrl };
      return;
    }
    docs.push({ documentType, fileUrl, status: 'PENDING' });
  }

  private applyFilesToDto(dto: any, fileUrls: FileUrlsMap) {
    const next = { ...dto };

    const docs = this.ensureArray<any>(next.documents).map((d) => ({ ...d }));
    const emergency = this.ensureArray<any>(next.emergencyContacts).map((c) => ({ ...c }));

    for (const key of Object.keys(fileUrls || {})) {
      const url = fileUrls[key];
      if (!url) continue;

      if (key === 'passportFile') this.upsertDoc(docs, 'PASSPORT', url);
      else if (key === 'personalPhoto') this.upsertDoc(docs, 'PERSONAL_PHOTO', url);
      else if (key === 'cocCertificateFile') this.upsertDoc(docs, 'COC_CERTIFICATE', url);
      else if (key === 'applicantIdFile') this.upsertDoc(docs, 'APPLICANT_ID', url);
      else if (key.startsWith('document_')) {
        const t = key.slice('document_'.length);
        if (t) this.upsertDoc(docs, t, url);
      } else if (key.startsWith('emergencyId_')) {
        const idxRaw = key.slice('emergencyId_'.length);
        const idx = Number(idxRaw);
        if (Number.isFinite(idx) && idx >= 0) {
          while (emergency.length <= idx) emergency.push({});
          emergency[idx] = { ...emergency[idx], idFileUrl: url };
        }
      }
    }

    if (docs.length) next.documents = docs;
    if (emergency.length) next.emergencyContacts = emergency;

    return next;
  }

  private collectOldPathsToDelete(existing: any, nextDto: any, fileUrls: FileUrlsMap) {
    const paths: string[] = [];
    const oldDocs = this.ensureArray<any>(existing?.documents);
    const oldEmergency = this.ensureArray<any>(existing?.emergencyContacts);

    const getOldDocUrl = (t: string) => (oldDocs.find((d) => String(d?.documentType) === t)?.fileUrl ?? null) as
      | string
      | null;
    const getNewDocUrl = (t: string) =>
      (this.ensureArray<any>(nextDto?.documents).find((d) => String(d?.documentType) === t)?.fileUrl ?? null) as
        | string
        | null;

    const getOldEmergencyUrl = (i: number) => (oldEmergency?.[i]?.idFileUrl ?? null) as string | null;
    const getNewEmergencyUrl = (i: number) => (this.ensureArray<any>(nextDto?.emergencyContacts)?.[i]?.idFileUrl ?? null) as
      | string
      | null;

    const considerDocType = (t: string) => {
      const oldUrl = getOldDocUrl(t);
      const newUrl = getNewDocUrl(t);
      if (oldUrl && newUrl && oldUrl !== newUrl) paths.push(oldUrl);
    };

    const considerEmergencyIndex = (i: number) => {
      const oldUrl = getOldEmergencyUrl(i);
      const newUrl = getNewEmergencyUrl(i);
      if (oldUrl && newUrl && oldUrl !== newUrl) paths.push(oldUrl);
    };

    for (const key of Object.keys(fileUrls || {})) {
      if (key === 'passportFile') considerDocType('PASSPORT');
      else if (key === 'personalPhoto') considerDocType('PERSONAL_PHOTO');
      else if (key === 'cocCertificateFile') considerDocType('COC_CERTIFICATE');
      else if (key === 'applicantIdFile') considerDocType('APPLICANT_ID');
      else if (key.startsWith('document_')) {
        const t = key.slice('document_'.length);
        if (t) considerDocType(t);
      } else if (key.startsWith('emergencyId_')) {
        const idxRaw = key.slice('emergencyId_'.length);
        const idx = Number(idxRaw);
        if (Number.isFinite(idx) && idx >= 0) considerEmergencyIndex(idx);
      }
    }

    return paths;
  }

  private normalizeDraftUpsertInput(dto: any) {
    const passportExpiry = dto.passportExpiry ? new Date(dto.passportExpiry) : null;
    this.draftTokens.ensurePassportExpiry(passportExpiry);

    const passportIssueDate = dto.passportIssueDate ? new Date(dto.passportIssueDate) : null;

    return {
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

      occupation: dto.occupation ?? null,

      height: dto.height ?? null,
      weight: dto.weight ?? null,

      laborId: dto.laborId ?? null,

      passportNumber: dto.passportNumber ?? null,
      passportPlace: dto.passportPlace ?? null,
      passportIssueDate,
      passportExpiry,

      address: dto.address ?? null,

      emergencyContacts: dto.emergencyContacts ? dto.emergencyContacts.map((c: any) => ({ ...c })) : undefined,
      skills: dto.skills
        ? dto.skills.map((s: any) => ({
            skillId: s.skillId,
            hasSkill: s.hasSkill ?? true,
            willingToLearn: s.willingToLearn ?? false
          }))
        : undefined,
      qualifications: dto.qualifications ? dto.qualifications.map((q: any) => ({ qualification: q.qualification })) : undefined,
      workExperiences: dto.workExperiences
        ? dto.workExperiences.map((w: any) => ({
            jobTitle: w.jobTitle,
            country: w.country ?? null,
            yearsWorked: w.yearsWorked ?? null
          }))
        : undefined,
      documents: dto.documents ? dto.documents.map((d: any) => ({ ...d })) : undefined
    };
  }

  async draftUpsertWithFiles(dto: any, fileUrls: FileUrlsMap) {
    const existing = await this.profiles.findByPhone(dto.phone);
    if (existing) this.status.ensureDraftEditable(existing.profileStatus);

    const dtoWithFiles = this.applyFilesToDto(dto, fileUrls);

    this.draftTokens.parseLaborId(dtoWithFiles.gender ?? null, dtoWithFiles.laborId ?? null);
    this.draftTokens.parseLaborId(dtoWithFiles.gender ?? null, dtoWithFiles.laborId ?? null);

    const passportExpiry = dtoWithFiles.passportExpiry ? new Date(dtoWithFiles.passportExpiry) : null;
    this.draftTokens.ensurePassportExpiry(passportExpiry);

    const passportIssueDate = dtoWithFiles.passportIssueDate ? new Date(dtoWithFiles.passportIssueDate) : null;

    const payload: any = this.normalizeDraftUpsertInput({
      ...dtoWithFiles,
      passportIssueDate,
      passportExpiry: dtoWithFiles.passportExpiry
    });

    payload.registrationSource = 'SELF';
    payload.createdBy = null;

    const oldToDelete = existing ? this.collectOldPathsToDelete(existing, dtoWithFiles, fileUrls) : [];

    const profile = await this.profiles.upsertDraft(payload);

    for (const p of oldToDelete) await safeDeleteUploadByRelativePath(p);

    const token = await this.draftTokens.rotate(profile.applicantId);
    return { applicantId: profile.applicantId, ...token };
  }

  async draftUpsert(dto: any) {
    return this.draftUpsertWithFiles(dto, {});
  }

  async agentDraftUpsertWithFiles(agentUserId: string, dto: any, fileUrls: FileUrlsMap) {
    const existing = await this.profiles.findByPhone(dto.phone);
    if (existing) this.status.ensureDraftEditable(existing.profileStatus);

    const dtoWithFiles = this.applyFilesToDto(dto, fileUrls);

    this.draftTokens.parseLaborId(dtoWithFiles.gender ?? null, dtoWithFiles.laborId ?? null);

    const passportExpiry = dtoWithFiles.passportExpiry ? new Date(dtoWithFiles.passportExpiry) : null;
    this.draftTokens.ensurePassportExpiry(passportExpiry);

    const passportIssueDate = dtoWithFiles.passportIssueDate ? new Date(dtoWithFiles.passportIssueDate) : null;

    const payload: any = this.normalizeDraftUpsertInput({
      ...dtoWithFiles,
      passportIssueDate,
      passportExpiry: dtoWithFiles.passportExpiry
    });

    payload.registrationSource = 'AGENCY';
    payload.createdBy = agentUserId;

    const oldToDelete = existing ? this.collectOldPathsToDelete(existing, dtoWithFiles, fileUrls) : [];

    const profile = await this.profiles.upsertDraft(payload);

    for (const p of oldToDelete) await safeDeleteUploadByRelativePath(p);

    return { ok: true, applicantId: profile.applicantId };
  }

  async agentDraftUpsert(agentUserId: string, dto: any) {
    return this.agentDraftUpsertWithFiles(agentUserId, dto, {});
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

  async draftUpdateWithFiles(applicantId: string, dto: any, fileUrls: FileUrlsMap) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new BadRequestException('Applicant not found');
    this.status.ensureDraftEditable(profile.profileStatus);

    const dtoWithFiles = this.applyFilesToDto(dto, fileUrls);
    const oldToDelete = this.collectOldPathsToDelete(profile, dtoWithFiles, fileUrls);

    const merged: any = {
      phone: profile.phone,
      email: dtoWithFiles.email ?? profile.email,

      firstName: dtoWithFiles.firstName ?? profile.firstName,
      middleName: dtoWithFiles.middleName ?? profile.middleName,
      lastName: dtoWithFiles.lastName ?? profile.lastName,
      gender: dtoWithFiles.gender ?? profile.gender,

      dateOfBirth: dtoWithFiles.dateOfBirth ? new Date(dtoWithFiles.dateOfBirth) : profile.dateOfBirth,
      placeOfBirth: dtoWithFiles.placeOfBirth ?? profile.placeOfBirth,
      nationality: dtoWithFiles.nationality ?? profile.nationality,
      religion: dtoWithFiles.religion ?? profile.religion,
      maritalStatus: dtoWithFiles.maritalStatus ?? profile.maritalStatus,
      numberOfChildren: dtoWithFiles.numberOfChildren ?? profile.numberOfChildren,

      occupation: dtoWithFiles.occupation ?? profile.occupation,

      height: dtoWithFiles.height ?? profile.height,
      weight: dtoWithFiles.weight ?? profile.weight,

      laborId: dtoWithFiles.laborId ?? profile.laborId,

      passportNumber: dtoWithFiles.passportNumber ?? profile.passportNumber,
      passportPlace: dtoWithFiles.passportPlace ?? profile.passportPlace,
      passportIssueDate: dtoWithFiles.passportIssueDate ? new Date(dtoWithFiles.passportIssueDate) : profile.passportIssueDate,
      passportExpiry: dtoWithFiles.passportExpiry ? new Date(dtoWithFiles.passportExpiry) : profile.passportExpiry,

      address: dtoWithFiles.address ?? profile.address,

      registrationSource: profile.registrationSource ?? 'SELF',
      createdBy: profile.createdBy ?? null,

      emergencyContacts: dtoWithFiles.emergencyContacts ? dtoWithFiles.emergencyContacts.map((c: any) => ({ ...c })) : undefined,
      skills: dtoWithFiles.skills
        ? dtoWithFiles.skills.map((s: any) => ({
            skillId: s.skillId,
            hasSkill: s.hasSkill ?? true,
            willingToLearn: s.willingToLearn ?? false
          }))
        : undefined,
      qualifications: dtoWithFiles.qualifications
        ? dtoWithFiles.qualifications.map((q: any) => ({ qualification: q.qualification }))
        : undefined,
      workExperiences: dtoWithFiles.workExperiences
        ? dtoWithFiles.workExperiences.map((w: any) => ({
            jobTitle: w.jobTitle,
            country: w.country ?? null,
            yearsWorked: w.yearsWorked ?? null
          }))
        : undefined,
      documents: dtoWithFiles.documents ? dtoWithFiles.documents.map((d: any) => ({ ...d })) : undefined
    };

    this.draftTokens.parseLaborId(merged.gender ?? null, merged.laborId ?? null);
    this.draftTokens.ensurePassportExpiry(merged.passportExpiry ?? null);

    await this.profiles.upsertDraft(merged);

    for (const p of oldToDelete) await safeDeleteUploadByRelativePath(p);

    const token = await this.draftTokens.rotate(applicantId);
    return { ok: true, ...token };
  }

  async draftUpdate(applicantId: string, dto: any) {
    return this.draftUpdateWithFiles(applicantId, dto, {});
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
      !profile.occupation ||
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
