import { BadRequestException, Injectable } from '@nestjs/common';
import { ApplicantProfileRepository } from '../repositories/applicant-profile.repository';
import { ApplicantStatusService } from './applicant-status.service';
import { safeDeleteUploadByRelativePath } from '../../../common/utils/upload/upload.utils';

type FileUrlsMap = Record<string, string>;

@Injectable()
export class ApplicantVerifiedService {
  constructor(private readonly profiles: ApplicantProfileRepository, private readonly status: ApplicantStatusService) {}

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
      }
    }

    if (docs.length) next.documents = docs;

    return next;
  }

  private collectOldPathsToDelete(existing: any, nextDto: any, fileUrls: FileUrlsMap) {
    const paths: string[] = [];
    const oldDocs = this.ensureArray<any>(existing?.documents);

    const getOldDocUrl = (t: string) => (oldDocs.find((d) => String(d?.documentType) === t)?.fileUrl ?? null) as
      | string
      | null;
    const getNewDocUrl = (t: string) =>
      (this.ensureArray<any>(nextDto?.documents).find((d) => String(d?.documentType) === t)?.fileUrl ?? null) as
        | string
        | null;

    const considerDocType = (t: string) => {
      const oldUrl = getOldDocUrl(t);
      const newUrl = getNewDocUrl(t);
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
      }
    }

    return paths;
  }

  async getByUserId(userId: string) {
    const profile = await this.profiles.findByUserId(userId);
    if (profile) return profile;
    throw new BadRequestException('Applicant profile not found for user');
  }

  async updateVerifiedWithFiles(applicantId: string, dto: any, existingStatus: string, fileUrls: FileUrlsMap) {
    this.status.ensureVerified(existingStatus);

    const existing = await this.profiles.findById(applicantId);
    if (!existing) throw new BadRequestException('Applicant not found');

    const dtoWithFiles = this.applyFilesToDto(dto, fileUrls);
    const oldToDelete = this.collectOldPathsToDelete(existing, dtoWithFiles, fileUrls);

    const patch: any = {
      email: dtoWithFiles.email ?? undefined,
      address: dtoWithFiles.address ?? undefined,
      maritalStatus: dtoWithFiles.maritalStatus ?? undefined,
      occupation: dtoWithFiles.occupation ?? undefined
    };

    if (dtoWithFiles.skills)
      patch.skills = dtoWithFiles.skills.map((s: any) => ({
        skillId: s.skillId,
        hasSkill: s.hasSkill ?? true,
        willingToLearn: s.willingToLearn ?? false
      }));

    if (dtoWithFiles.qualifications)
      patch.qualifications = dtoWithFiles.qualifications.map((q: any) => ({ qualification: q.qualification }));

    if (dtoWithFiles.workExperiences)
      patch.workExperiences = dtoWithFiles.workExperiences.map((w: any) => ({
        jobTitle: w.jobTitle,
        country: w.country ?? null,
        yearsWorked: w.yearsWorked ?? null
      }));

    if (dtoWithFiles.documents) patch.documents = dtoWithFiles.documents.map((d: any) => ({ ...d }));

    const updated = await this.profiles.updateVerified(applicantId, patch);

    for (const p of oldToDelete) await safeDeleteUploadByRelativePath(p);

    return updated;
  }

  async updateVerified(applicantId: string, dto: any, existingStatus: string) {
    return this.updateVerifiedWithFiles(applicantId, dto, existingStatus, {});
  }
}
