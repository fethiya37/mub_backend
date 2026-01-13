import { Injectable } from '@nestjs/common';

@Injectable()
export class CvRenderService {
  private escape(v: any) {
    return String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  private renderList(items: string[]) {
    if (!items?.length) return '';
    return `<ul>${items.map((x) => `<li>${this.escape(x)}</li>`).join('')}</ul>`;
  }

  private sectionHtml(sectionName: string, payload: any) {
    const a = payload.applicant ?? {};
    const job = payload.job ?? null;

    const fullName = `${a.firstName ?? ''} ${a.lastName ?? ''}`.trim() || 'Applicant';

    if (sectionName === 'header') {
      return `
        <div class="cv-header">
          <h1>${this.escape(fullName)}</h1>
          <div class="cv-subtitle">${this.escape(job?.jobTitle ?? payload.targetRole ?? '')}</div>
          <div class="cv-contact">
            <div>${this.escape(a.phone ?? '')}</div>
            <div>${this.escape(a.email ?? '')}</div>
            <div>${this.escape(a.region ?? '')} ${this.escape(a.nationality ?? '')}</div>
          </div>
        </div>
      `;
    }

    if (sectionName === 'summary') {
      const text = payload.summary ?? '';
      const keywords = payload.keywords ?? [];
      return `
        <section class="cv-section">
          <h2>Professional Summary</h2>
          <p>${this.escape(text)}</p>
          ${keywords.length ? `<div class="cv-keywords"><b>Keywords:</b> ${this.escape(keywords.join(', '))}</div>` : ''}
        </section>
      `;
    }

    if (sectionName === 'skills') {
      return `
        <section class="cv-section">
          <h2>Core Skills</h2>
          ${this.renderList(payload.skills ?? [])}
        </section>
      `;
    }

    if (sectionName === 'experience') {
      const exp = payload.experiences ?? [];
      return `
        <section class="cv-section">
          <h2>Work Experience</h2>
          ${exp
            .map(
              (e: any) => `
              <div class="cv-item">
                <div class="cv-item-title">${this.escape(e.jobTitle ?? '')}</div>
                <div class="cv-item-sub">${this.escape(e.employerName ?? '')} ${this.escape(e.country ?? '')}</div>
                <div class="cv-item-date">${this.escape(e.startDate ?? '')} - ${this.escape(e.endDate ?? 'Present')}</div>
                ${e.responsibilities ? `<div class="cv-item-body">${this.escape(e.responsibilities)}</div>` : ''}
              </div>
            `
            )
            .join('')}
        </section>
      `;
    }

    if (sectionName === 'education') {
      const edu = payload.education ?? [];
      return `
        <section class="cv-section">
          <h2>Education & Qualifications</h2>
          ${edu
            .map(
              (q: any) => `
              <div class="cv-item">
                <div class="cv-item-title">${this.escape(q.qualificationType ?? '')}</div>
                <div class="cv-item-sub">${this.escape(q.institution ?? '')} ${this.escape(q.country ?? '')}</div>
                <div class="cv-item-date">${this.escape(q.yearCompleted ?? '')}</div>
              </div>
            `
            )
            .join('')}
        </section>
      `;
    }

    if (sectionName === 'certifications') {
      return `
        <section class="cv-section">
          <h2>Certifications & Training</h2>
          ${this.renderList(payload.certifications ?? [])}
        </section>
      `;
    }

    if (sectionName === 'personalInfo') {
      const dob = payload.personalInfo?.dateOfBirth ?? '';
      const nat = payload.personalInfo?.nationality ?? '';
      const ms = payload.personalInfo?.maritalStatus ?? '';
      const g = payload.personalInfo?.gender ?? '';
      return `
        <section class="cv-section">
          <h2>Personal Information</h2>
          <div class="cv-kv">
            <div><b>Date of Birth:</b> ${this.escape(dob)}</div>
            <div><b>Nationality:</b> ${this.escape(nat)}</div>
            <div><b>Marital Status:</b> ${this.escape(ms)}</div>
            <div><b>Gender:</b> ${this.escape(g)}</div>
          </div>
        </section>
      `;
    }

    if (sectionName === 'preferences') {
      const pref = payload.preferences ?? {};
      return `
        <section class="cv-section">
          <h2>Availability & Job Preferences</h2>
          <div class="cv-kv">
            <div><b>Preferred Job Role:</b> ${this.escape(pref.preferredRole ?? payload.targetRole ?? '')}</div>
            <div><b>Preferred Country:</b> ${this.escape(pref.preferredCountry ?? payload.country ?? '')}</div>
            <div><b>Availability Date:</b> ${this.escape(pref.availabilityDate ?? '')}</div>
            <div><b>Willingness to Relocate:</b> ${this.escape(pref.willingToRelocate ?? '')}</div>
          </div>
        </section>
      `;
    }

    if (sectionName === 'declaration') {
      return `
        <section class="cv-section">
          <h2>Declaration</h2>
          <p>${this.escape(payload.declaration ?? 'I hereby declare that the information provided above is true and correct to the best of my knowledge.')}</p>
        </section>
      `;
    }

    return '';
  }

  buildHtml(input: {
    templateHtml: string;
    templateCss?: string | null;
    sections: { sectionName: string; isEnabled: boolean; displayOrder: number; customContent?: any | null }[];
    payload: any;
  }) {
    const ordered = (input.sections ?? [])
      .filter((s) => s.isEnabled !== false)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const body = ordered
      .map((s) => {
        const base = this.sectionHtml(String(s.sectionName), input.payload);
        return base;
      })
      .join('');

    const cssBlock = `<style>${input.templateCss ?? ''}</style>`;
    const doc = input.templateHtml
      .replace('{{CSS}}', cssBlock)
      .replace('{{BODY}}', body);

    return doc;
  }
}
