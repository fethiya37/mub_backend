import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class VisaStatusService {
  private readonly allowed: Record<string, string[]> = {
    DRAFT: ['SUBMITTED', 'WITHDRAWN'],
    SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
    UNDER_REVIEW: ['ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING', 'REJECTED', 'WITHDRAWN'],
    ADDITIONAL_DOCUMENTS_REQUIRED: ['UNDER_REVIEW', 'WITHDRAWN'],
    EMBASSY_PROCESSING: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
    APPROVED: ['EXPIRED'],
    REJECTED: [],
    EXPIRED: [],
    WITHDRAWN: []
  };

  ensureTransition(current: string, next: string) {
    const allowed = this.allowed[current] ?? [];
    if (!allowed.includes(next)) throw new BadRequestException(`Invalid visa status transition: ${current} -> ${next}`);
  }

  ensureDraftEditable(status: string) {
    if (status !== 'DRAFT') throw new BadRequestException('Visa is not editable in this status');
  }

  ensureCanSubmit(status: string) {
    if (status !== 'DRAFT') throw new BadRequestException('Only DRAFT visa can be submitted');
  }

  ensureDecisionAllowed(status: string) {
    if (!['UNDER_REVIEW', 'EMBASSY_PROCESSING'].includes(status)) throw new BadRequestException('Decision not allowed in this status');
  }

  ensureApplicantReadable(status: string) {
    if (!['SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING', 'APPROVED', 'REJECTED', 'EXPIRED', 'WITHDRAWN'].includes(status)) {
      throw new BadRequestException('Visa not visible yet');
    }
  }
}
