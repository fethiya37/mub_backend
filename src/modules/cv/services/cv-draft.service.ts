import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ApplicantProfileRepository } from '../../applicants/repositories/applicant-profile.repository';
import { JobPostingRepository } from '../../employers/repositories/job-posting.repository';
import { CvTemplateService } from './cv-template.service';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';
import { ApplicantCvSectionRepository } from '../repositories/applicant-cv-section.repository';
import { CvStatusService } from './cv-status.service';
import { CV_SECTIONS } from '../dto/shared/cv.enums.dto';
import { CvAuditService } from './cv-audit.service';

@Injectable()
export class CvDraftService {
  constructor(
    private readonly profiles: ApplicantProfileRepository,
    private readonly jobs: JobPostingRepository,
    private readonly templates: CvTemplateService,
    private readonly cvs: ApplicantCvRepository,
    private readonly sections: ApplicantCvSectionRepository,
    private readonly status: CvStatusService,
    private readonly cvAudit: CvAuditService
  ) {}

  private defaultSections() {
    const list = [
      CV_SECTIONS.header,
      CV_SECTIONS.summary,
      CV_SECTIONS.skills,
      CV_SECTIONS.experience,
      CV_SECTIONS.education,
      CV_SECTIONS.certifications,
      CV_SECTIONS.personalInfo,
      CV_SECTIONS.preferences,
      CV_SECTIONS.declaration
    ];

    return list.map((name, idx) => ({
      sectionName: name,
      isEnabled: true,
      displayOrder: idx + 1,
      customContent: null
    }));
  }

  async createDraft(applicantId: string, userId: string, dto: any) {
    const profile = await this.profiles.findById(applicantId);
    if (!profile) throw new NotFoundException('Applicant profile not found');
    if (profile.profileStatus !== 'VERIFIED') throw new BadRequestException('Applicant profile must be VERIFIED');

    let jobId: string | null = dto.jobId ?? null;
    if (jobId) {
      const job = await this.jobs.findById(jobId);
      if (!job) throw new BadRequestException('Job not found');
    }

    const template = dto.cvTemplateId
      ? await this.templates.get(dto.cvTemplateId)
      : await this.templates.getDefaultActive();

    const cv = await this.cvs.create({
      applicantId,
      jobId,
      cvTemplateId: template.id
    });

    const baseSections = this.defaultSections();
    const finalSections = dto.summary
      ? baseSections.map((s) =>
          s.sectionName === CV_SECTIONS.summary ? { ...s, customContent: { text: dto.summary } } : s
        )
      : baseSections;

    await this.sections.replaceAll(cv.id, finalSections as any);

    await this.cvAudit.log(cv.id, 'CV_DRAFT_CREATED', userId, { jobId, cvTemplateId: template.id });

    return this.cvs.findById(cv.id);
  }

  async updateDraft(applicantId: string, userId: string, cvId: string, dto: any) {
    const cv = await this.cvs.findById(cvId);
    if (!cv) throw new NotFoundException('CV not found');
    if (cv.applicantId !== applicantId) throw new BadRequestException('CV not found');
    this.status.ensureEditable(cv.status);

    if (dto.sections) {
      const normalized = dto.sections.map((s: any) => ({
        cvId,
        sectionName: s.sectionName,
        isEnabled: s.isEnabled,
        displayOrder: s.displayOrder,
        customContent: s.customContent ?? null
      }));
      await this.sections.replaceAll(cvId, normalized);
    }

    if (dto.summary) {
      const existing = await this.sections.listByCv(cvId);

      const next = existing.map((s: any) =>
        s.sectionName === CV_SECTIONS.summary
          ? { ...s, customContent: { ...(s.customContent ?? {}), text: dto.summary } }
          : s
      );

      const hasSummary = next.some((s: any) => s.sectionName === CV_SECTIONS.summary);

      const ensured = hasSummary
        ? next
        : [
            ...next,
            {
              sectionName: CV_SECTIONS.summary,
              isEnabled: true,
              displayOrder: next.length ? Math.max(...next.map((x: any) => x.displayOrder)) + 1 : 1,
              customContent: { text: dto.summary }
            }
          ];

      await this.sections.replaceAll(
        cvId,
        ensured.map((s: any) => ({
          cvId,
          sectionName: s.sectionName,
          isEnabled: s.isEnabled !== false,
          displayOrder: Number(s.displayOrder) || 1,
          customContent: s.customContent ?? null
        })) as any
      );
    }

    await this.cvAudit.log(cvId, 'CV_DRAFT_UPDATED', userId, { hasSections: !!dto.sections, hasSummary: !!dto.summary });

    return this.cvs.findById(cvId);
  }

  async submit(applicantId: string, userId: string, cvId: string) {
    const cv = await this.cvs.findById(cvId);
    if (!cv) throw new NotFoundException('CV not found');
    if (cv.applicantId !== applicantId) throw new BadRequestException('CV not found');
    this.status.ensureSubmittable(cv.status);

    const updated = await this.cvs.update(cvId, { status: 'submitted', submittedAt: new Date() });

    await this.cvAudit.log(cvId, 'CV_SUBMITTED', userId, { status: updated.status });

    return { ok: true, cvId };
  }
}
