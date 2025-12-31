import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ApplicantStatusService {
  ensureDraftEditable(status: string) {
    if (!['DRAFT', 'REJECTED'].includes(status)) throw new BadRequestException('Profile not editable in this status');
  }

  ensureCanSubmit(status: string) {
    if (!['DRAFT', 'REJECTED'].includes(status)) throw new BadRequestException('Only DRAFT/REJECTED can be submitted');
  }

  ensureAdminCanReject(status: string) {
    if (status !== 'SUBMITTED') throw new BadRequestException('Only SUBMITTED can be rejected');
  }

  ensureAdminCanVerify(status: string) {
    if (status !== 'SUBMITTED') throw new BadRequestException('Only SUBMITTED can be verified');
  }

  ensureVerified(status: string) {
    if (status !== 'VERIFIED') throw new BadRequestException('Only VERIFIED profile can be updated here');
  }
}
