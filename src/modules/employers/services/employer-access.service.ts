import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployerRepository } from '../repositories/employer.repository';

@Injectable()
export class EmployerAccessService {
  constructor(private readonly employers: EmployerRepository) {}

  async getEmployerForUser(userId: string) {
    const employer = await this.employers.findByUserId(userId);
    if (!employer) throw new NotFoundException('Employer not found for user');
    return employer;
  }

  ensureApproved(employer: { status: string }) {
    if (employer.status !== 'APPROVED') throw new ForbiddenException('Employer is not approved');
  }
}
