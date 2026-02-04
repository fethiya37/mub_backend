import { BadRequestException } from '@nestjs/common';

export class JobApplicationStatusService {
  ensureCanApply(existingStatus: string | null) {
    if (!existingStatus) return;
    if (!['REJECTED', 'WITHDRAWN'].includes(existingStatus)) {
      throw new BadRequestException('You already have an active application for this job');
    }
  }

  ensureCvEditable(status: string) {
    if (status !== 'PENDING') throw new BadRequestException('CV can only be updated while application is PENDING');
  }

  ensureWithdrawAllowed(status: string) {
    if (status !== 'PENDING') throw new BadRequestException('Only PENDING application can be withdrawn');
  }

  ensureAdminCanApprove(status: string) {
    if (status !== 'PENDING') throw new BadRequestException('Only PENDING application can be approved');
  }

  ensureAdminCanReject(status: string) {
    if (status !== 'PENDING') throw new BadRequestException('Only PENDING application can be rejected');
  }

  ensureEmployerCanDecide(status: string) {
    if (status !== 'APPROVED') throw new BadRequestException('Only APPROVED application can be decided by employer');
  }

  ensureEmployerRejectHasReason(reason: string | undefined) {
    if (!reason || reason.trim().length < 2) throw new BadRequestException('Rejection reason is required');
  }
}
