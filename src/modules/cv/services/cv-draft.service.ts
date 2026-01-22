import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';
import { ApplicantCvSectionRepository } from '../repositories/applicant-cv-section.repository';
import { CvTemplateService } from './cv-template.service';
import { CvStatusService } from './cv-status.service';
import { CV_SECTIONS, CV_STATUS } from '../dto/shared/cv.enums.dto';
import { CvAuditService } from './cv-audit.service';

@Injectable()
export class CvDraftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: CvTemplateService,
    private readonly cvs: ApplicantCvRepository,
    private readonly sections: ApplicantCvSectionRepository,
    private readonly status: CvStatusService,
    private readonly audit: CvAuditService
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

  private async ensureJobExists(jobId: string) {
    const job = await this.prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new BadRequestException('Job not found');
    return job;
  }

  async createDraft(input: { applicantId: string; performedBy: string; jobId?: string; summary?: string }) {
    const profile = await this.prisma.applicantProfile.findUnique({ where: { applicantId: input.applicantId } });
    if (!profile) throw new NotFoundException('Applicant profile not found');
    if (profile.profileStatus !== 'VERIFIED') throw new BadRequestException('Applicant profile must be VERIFIED');

    const jobId = input.jobId ?? null;
    if (jobId) await this.ensureJobExists(jobId);

    const template = await this.templates.getDefaultActive();

    const cv = await this.cvs.create({
      applicantId: input.applicantId,
      jobId,
      cvTemplateId: template.id
    });

    const base = this.defaultSections();

    const finalSections = input.summary
      ? base.map((s) => (s.sectionName === CV_SECTIONS.summary ? { ...s, customContent: { text: input.summary } } : s))
      : base;

    await this.sections.replaceAll(cv.id, finalSections as any);

    await this.audit.log(cv.id, 'CV_DRAFT_CREATED', input.performedBy, {
      applicantId: input.applicantId,
      jobId,
      templateId: template.id
    });

    return this.cvs.findById(cv.id);
  }

  async updateDraft(input: {
    applicantId: string;
    performedBy: string;
    cvId: string;
    summary?: string;
    sections?: any[];
  }) {
    const cv = await this.cvs.findById(input.cvId);
    if (!cv) throw new NotFoundException('CV not found');
    if (cv.applicantId !== input.applicantId) throw new NotFoundException('CV not found');

    this.status.ensureEditable(cv.status);

    if (input.sections) {
      const normalized = input.sections.map((s: any) => ({
        cvId: input.cvId,
        sectionName: s.sectionName,
        isEnabled: s.isEnabled !== false,
        displayOrder: Number(s.displayOrder) || 1,
        customContent: s.customContent ?? null
      }));
      await this.sections.replaceAll(input.cvId, normalized);
    }

    if (input.summary) {
      const existing = await this.sections.listByCv(input.cvId);

      const next = existing.map((s: any) =>
        String(s.sectionName) === CV_SECTIONS.summary
          ? { ...s, customContent: { ...(s.customContent ?? {}), text: input.summary } }
          : s
      );

      const hasSummary = next.some((s: any) => String(s.sectionName) === CV_SECTIONS.summary);

      const ensured = hasSummary
        ? next
        : [
            ...next,
            {
              sectionName: CV_SECTIONS.summary,
              isEnabled: true,
              displayOrder: next.length ? Math.max(...next.map((x: any) => x.displayOrder)) + 1 : 1,
              customContent: { text: input.summary }
            }
          ];

      await this.sections.replaceAll(
        input.cvId,
        ensured.map((s: any) => ({
          cvId: input.cvId,
          sectionName: s.sectionName,
          isEnabled: s.isEnabled !== false,
          displayOrder: Number(s.displayOrder) || 1,
          customContent: s.customContent ?? null
        })) as any
      );
    }

    await this.audit.log(input.cvId, 'CV_DRAFT_UPDATED', input.performedBy, {
      hasSections: !!input.sections,
      hasSummary: !!input.summary
    });

    return this.cvs.findById(input.cvId);
  }

  async submit(input: { applicantId: string; performedBy: string; cvId: string }) {
    const cv = await this.cvs.findById(input.cvId);
    if (!cv) throw new NotFoundException('CV not found');
    if (cv.applicantId !== input.applicantId) throw new NotFoundException('CV not found');

    this.status.ensureSubmittable(cv.status);

    await this.cvs.update(input.cvId, { status: CV_STATUS.submitted, submittedAt: new Date() });

    await this.audit.log(input.cvId, 'CV_SUBMITTED', input.performedBy, { status: CV_STATUS.submitted });

    return { ok: true, cvId: input.cvId };
  }
}
