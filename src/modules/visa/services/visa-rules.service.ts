import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class VisaRulesService {
  requiredDocumentsFor(destinationCountry: string) {
    const base = ['PASSPORT', 'MEDICAL_CLEARANCE', 'POLICE_CLEARANCE', 'EMPLOYMENT_CONTRACT', 'EMBASSY_FORMS'];
    const c = (destinationCountry || '').toLowerCase();

    if (c.includes('saudi') || c.includes('uae') || c.includes('qatar') || c.includes('kuwait') || c.includes('oman') || c.includes('bahrain')) {
      return [...base, 'INVITATION_LETTER'];
    }

    return base;
  }

  ensureRequiredDocsPresent(docTypesActive: Set<string>, destinationCountry: string) {
    const required = this.requiredDocumentsFor(destinationCountry);
    const missing = required.filter((t) => !docTypesActive.has(t));
    if (missing.length) throw new BadRequestException(`Missing required visa documents: ${missing.join(', ')}`);
  }

  ensureApprovedDates(issue: Date | null, expiry: Date | null) {
    if (!issue || !expiry) throw new BadRequestException('Visa issue and expiry dates are required for approval');
    if (expiry.getTime() <= issue.getTime()) throw new BadRequestException('Visa expiry must be after issue date');
  }
}
