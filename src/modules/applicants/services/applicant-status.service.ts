import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class ApplicantStatusService {
  ensureCanUpdateProfile(status: string) {
    if (!['DRAFT', 'REJECTED'].includes(status)) throw new BadRequestException('Profile cannot be edited in this status');
  }

  ensureCanSubmit(status: string) {
    if (!['DRAFT', 'REJECTED'].includes(status)) throw new BadRequestException('Only DRAFT/REJECTED can be submitted');
  }

  ensureCanVerifyOrReject(status: string) {
    if (status !== 'SUBMITTED') throw new BadRequestException('Only SUBMITTED can be verified/rejected');
  }
}
