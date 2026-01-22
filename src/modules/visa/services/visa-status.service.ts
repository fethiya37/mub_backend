import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class VisaStatusService {
  ensureDraftEditable(status: string) {
    if (status !== 'DRAFT') throw new BadRequestException('Visa application is not editable in this status');
  }

  ensureCanSubmit(status: string) {
    if (status !== 'DRAFT') throw new BadRequestException('Only DRAFT visa can be submitted');
  }

  ensureCanDecide(status: string) {
    const allowed = ['SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING'];
    if (!allowed.includes(status)) throw new BadRequestException('Decision not allowed in this status');
  }

  ensureTransition(prev: string, next: string) {
    if (prev === next) return;

    const allowed: Record<string, string[]> = {
      DRAFT: ['SUBMITTED', 'WITHDRAWN'],
      SUBMITTED: ['UNDER_REVIEW', 'WITHDRAWN'],
      UNDER_REVIEW: ['ADDITIONAL_DOCUMENTS_REQUIRED', 'EMBASSY_PROCESSING', 'APPROVED', 'REJECTED', 'WITHDRAWN'],
      ADDITIONAL_DOCUMENTS_REQUIRED: ['UNDER_REVIEW', 'EMBASSY_PROCESSING', 'WITHDRAWN'],
      EMBASSY_PROCESSING: ['APPROVED', 'REJECTED', 'WITHDRAWN'],
      APPROVED: ['EXPIRED'],
      REJECTED: [],
      EXPIRED: [],
      WITHDRAWN: []
    };

    const nexts = allowed[prev] ?? [];
    if (!nexts.includes(next)) throw new BadRequestException(`Invalid visa status transition: ${prev} -> ${next}`);
  }

  ensureDecisionPayload(decision: 'APPROVED' | 'REJECTED', payload: { rejectionReason?: string; visaIssueDate?: string; visaExpiryDate?: string }) {
    if (decision === 'REJECTED') {
      if (!payload.rejectionReason || payload.rejectionReason.trim().length < 2) {
        throw new BadRequestException('rejectionReason is required for REJECTED decision');
      }
    }
    if (decision === 'APPROVED') {
      if (!payload.visaIssueDate || !payload.visaExpiryDate) throw new BadRequestException('visaIssueDate and visaExpiryDate are required for APPROVED decision');
      const issue = new Date(payload.visaIssueDate);
      const expiry = new Date(payload.visaExpiryDate);
      if (Number.isNaN(issue.getTime()) || Number.isNaN(expiry.getTime())) throw new BadRequestException('Invalid visa issue/expiry date');
      if (expiry.getTime() <= issue.getTime()) throw new BadRequestException('visaExpiryDate must be after visaIssueDate');
    }
  }
}
