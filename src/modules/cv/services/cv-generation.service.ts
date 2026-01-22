import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantCvRepository } from '../repositories/applicant-cv.repository';
import { ApplicantCvSectionRepository } from '../repositories/applicant-cv-section.repository';
import { ApplicantCvVersionRepository } from '../repositories/applicant-cv-version.repository';
import { CvTemplateService } from './cv-template.service';
import { CvRenderService } from './cv-render.service';
import { CvPdfService } from './cv-pdf.service';
import { FileStorageService } from '../storage/file-storage.service';
import { CvAuditService } from './cv-audit.service';
import { CV_SECTIONS, CV_STATUS } from '../dto/shared/cv.enums.dto';

@Injectable()
export class CvGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly templates: CvTemplateService,
    private readonly cvs: ApplicantCvRepository,
    private readonly sectionsRepo: ApplicantCvSectionRepository,
    private readonly versions: ApplicantCvVersionRepository,
    private readonly render: CvRenderService,
    private readonly pdf: CvPdfService,
    private readonly storage: FileStorageService,
    private readonly audit: CvAuditService
  ) {}

  private isoDate(d: any) {
    if (!d) return null;
    const dt = d instanceof Date ? d : new Date(d);
    if (Number.isNaN(dt.getTime())) return null;
    return dt.toISOString().slice(0, 10);
  }

  private extractKeywords(text: string) {
    const raw = (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4);

    const stop = new Set(['with', 'have', 'will', 'this', 'that', 'from', 'your', 'they', 'their', 'able', 'must']);

    const freq: Record<string, number> = {};
    for (const w of raw) {
      if (stop.has(w)) continue;
      freq[w] = (freq[w] ?? 0) + 1;
    }

    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([w]) => w);
  }

  private normalizeResponsibilities(value: any) {
    if (!value) return null;
    if (Array.isArray(value)) return value.filter(Boolean).join('\n');
    return String(value);
  }

  private applySectionOverrides(sections: any[], payload: any) {
    const map = new Map(sections.map((s) => [String(s.sectionName), s]));

    const summary = map.get(CV_SECTIONS.summary)?.customContent?.text ?? payload.summary ?? null;

    const skillsOverride = map.get(CV_SECTIONS.skills)?.customContent?.items ?? null;
    const expOverride = map.get(CV_SECTIONS.experience)?.customContent?.items ?? null;
    const eduOverride = map.get(CV_SECTIONS.education)?.customContent?.items ?? null;
    const declarationOverride = map.get(CV_SECTIONS.declaration)?.customContent?.text ?? null;

    return {
      ...payload,
      summary,
      skills: Array.isArray(skillsOverride) ? skillsOverride : payload.skills,
      experiences: Array.isArray(expOverride) ? expOverride : payload.experiences,
      education: Array.isArray(eduOverride) ? eduOverride : payload.education,
      declaration: declarationOverride ?? payload.declaration
    };
  }

  async generate(input: { applicantId: string; performedBy: string; cvId?: string; jobId?: string }) {
    let cv: any | null = null;

    if (input.cvId) {
      cv = await this.cvs.findById(input.cvId);
      if (!cv) throw new NotFoundException('CV not found');
      if (cv.applicantId !== input.applicantId) throw new BadRequestException('CV not found');
    } else {
      if (!input.jobId) throw new BadRequestException('cvId or jobId required');

      cv = await this.cvs.findByApplicantAndJob(input.applicantId, input.jobId);

      if (!cv) {
        const template = await this.templates.getDefaultActive();
        cv = await this.cvs.create({ applicantId: input.applicantId, jobId: input.jobId, cvTemplateId: template.id });
      }

      cv = await this.cvs.findById(cv.id);
      if (!cv) throw new NotFoundException('CV not found');
    }

    const applicant = await this.prisma.applicantProfile.findUnique({
      where: { applicantId: input.applicantId },
      include: {
        skills: true,
        qualifications: true,
        workExperiences: true,
        documents: true
      }
    });

    if (!applicant) throw new NotFoundException('Applicant profile not found');

    const job = cv.jobId ? await this.prisma.jobPosting.findUnique({ where: { id: cv.jobId } }) : null;

    const sections = await this.sectionsRepo.listByCv(cv.id);

    const template = cv.template ?? (await this.templates.get(cv.cvTemplateId));
    if (!template) throw new NotFoundException('CV template not found');

    const summaryFromSection =
      sections.find((s: any) => String(s.sectionName) === CV_SECTIONS.summary)?.customContent?.text ?? null;

    const keywords = job?.jobDescription ? this.extractKeywords(job.jobDescription) : [];

    const certifications = (applicant.documents ?? []).map((d: any) => d?.documentType).filter(Boolean);

    const payloadBase = {
      applicant,
      job,
      summary: summaryFromSection,
      keywords,
      skills: (applicant.skills ?? []).map((s: any) => s.skillName).filter(Boolean),
      experiences: (applicant.workExperiences ?? []).map((w: any) => ({
        jobTitle: w.jobTitle,
        employerName: w.employerName ?? null,
        country: w.country ?? null,
        startDate: this.isoDate(w.startDate),
        endDate: this.isoDate(w.endDate),
        responsibilities: this.normalizeResponsibilities(w.responsibilities)
      })),
      education: (applicant.qualifications ?? []).map((q: any) => ({
        qualificationType: q.qualificationType,
        institution: q.institution ?? null,
        country: q.country ?? null,
        yearCompleted: q.yearCompleted ?? null
      })),
      certifications,
      personalInfo: {
        dateOfBirth: this.isoDate(applicant.dateOfBirth),
        nationality: applicant.nationality ?? null,
        maritalStatus: applicant.maritalStatus ?? null,
        gender: applicant.gender ?? null
      },
      preferences: {
        preferredRole: job?.jobTitle ?? null,
        preferredCountry: job?.country ?? null,
        availabilityDate: this.isoDate((applicant as any).availableFrom),
        willingToRelocate: (applicant as any).willingToRelocate ? 'Yes' : 'No'
      },
      declaration: 'I hereby declare that the information provided above is true and correct to the best of my knowledge.'
    };

    const payload = this.applySectionOverrides(sections, payloadBase);

    const html = this.render.buildHtml({
      templateHtml: template.htmlTemplate,
      templateCss: template.cssStyle ?? null,
      sections,
      payload
    });

    const pdfBuffer = await this.pdf.generatePdfFromHtml(html);
    const saved = await this.storage.savePdf(pdfBuffer, 'pdf');

    const nextVersion = (cv.currentVersion ?? 0) + 1;
    const isFinal = String(cv.status).toLowerCase() === CV_STATUS.approved;

    await this.versions.create({
      cvId: cv.id,
      versionNumber: nextVersion,
      pdfUrl: saved.fileName,
      htmlSnapshot: html,
      isFinal
    });

    await this.cvs.update(cv.id, { currentVersion: nextVersion });

    await this.audit.log(cv.id, 'CV_GENERATED', input.performedBy, {
      versionNumber: nextVersion,
      jobId: cv.jobId ?? null,
      keywords
    });

    return { ok: true, cvId: cv.id, versionNumber: nextVersion };
  }
}
