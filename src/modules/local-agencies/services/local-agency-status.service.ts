import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class LocalAgencyStatusService {
  ensureCanApprove(status: string) {
    if (status !== 'PENDING') throw new BadRequestException('Only PENDING agencies can be approved');
  }

  ensureCanReject(status: string) {
    if (status !== 'PENDING') throw new BadRequestException('Only PENDING agencies can be rejected');
  }

  ensureCanSuspend(status: string) {
    if (status !== 'APPROVED') throw new BadRequestException('Only APPROVED agencies can be suspended');
  }

  ensureCanReactivate(status: string) {
    if (status !== 'SUSPENDED') throw new BadRequestException('Only SUSPENDED agencies can be reactivated');
  }
}
