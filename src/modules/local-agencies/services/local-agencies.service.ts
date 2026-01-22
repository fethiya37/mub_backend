import { ConflictException, Injectable } from '@nestjs/common';
import { LocalAgencyRepository } from '../repositories/local-agency.repository';

@Injectable()
export class LocalAgenciesService {
  constructor(private readonly agencies: LocalAgencyRepository) {}

  async register(dto: { name: string; licenseNumber: string; contactPerson?: string; phone?: string; email?: string }) {
    const exists = await this.agencies.findByLicenseNumber(dto.licenseNumber);
    if (exists) throw new ConflictException('License number already exists');

    return this.agencies.create({
      name: dto.name,
      licenseNumber: dto.licenseNumber,
      contactPerson: dto.contactPerson ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null
    });
  }

  async adminCreate(
    dto: { name: string; licenseNumber: string; contactPerson?: string; phone?: string; email?: string },
    _performedBy: string
  ) {
    const exists = await this.agencies.findByLicenseNumber(dto.licenseNumber);
    if (exists) throw new ConflictException('License number already exists');

    return this.agencies.create({
      name: dto.name,
      licenseNumber: dto.licenseNumber,
      contactPerson: dto.contactPerson ?? null,
      phone: dto.phone ?? null,
      email: dto.email ?? null
    });
  }
}
