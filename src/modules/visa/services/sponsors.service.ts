import { Injectable, NotFoundException } from '@nestjs/common';
import { SponsorRepository } from '../repositories/sponsor.repository';
import { AdminUpsertSponsorDto } from '../dto/admin/admin-upsert-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private readonly sponsorRepo: SponsorRepository) {}

  async create(dto: AdminUpsertSponsorDto, sponsorIdFileUrl?: string) {
    return this.sponsorRepo.create({
      fullName: dto.fullName,
      iqamaNumber: dto.iqamaNumber,
      employerId: dto.employerId,
      phone: dto.phone ?? null,
      sponsorIdFileUrl: sponsorIdFileUrl ?? null,
    });
  }

  async update(
    id: string,
    dto: AdminUpsertSponsorDto,
    sponsorIdFileUrl?: string,
  ) {
    const existing = await this.sponsorRepo.findById(id);
    if (!existing) throw new NotFoundException('Sponsor not found');

    return this.sponsorRepo.update(id, {
      fullName: dto.fullName,
      iqamaNumber: dto.iqamaNumber,
      employerId: dto.employerId,
      phone: dto.phone ?? null,
      sponsorIdFileUrl: sponsorIdFileUrl ?? existing.sponsorIdFileUrl,
    });
  }

  async get(id: string) {
    const sponsor = await this.sponsorRepo.findById(id);
    if (!sponsor) throw new NotFoundException('Sponsor not found');
    return sponsor;
  }

  async list(
    filters: { q?: string; employerId?: string },
    page: number,
    pageSize: number,
  ) {
    return this.sponsorRepo.list(filters, page, pageSize);
  }

  async getSponsorsByEmployer(employerId: string) {
    return this.sponsorRepo.findByEmployerId(employerId);
  }
}
