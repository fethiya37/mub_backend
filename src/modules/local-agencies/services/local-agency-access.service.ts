import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { LocalAgencyRepository } from '../repositories/local-agency.repository';

@Injectable()
export class LocalAgencyAccessService {
  constructor(private readonly agencies: LocalAgencyRepository) {}

  async getAgencyForUser(userId: string) {
    const agency = await this.agencies.findByUserId(userId);
    if (!agency) throw new NotFoundException('Local agency not found for user');
    if (agency.status !== 'APPROVED') throw new ForbiddenException('Local agency is not approved');
    return agency;
  }
}
