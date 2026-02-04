import { Injectable, NotFoundException } from '@nestjs/common';
import { SponsorRepository } from '../repositories/sponsor.repository';
import type { AdminUpsertSponsorDto } from '../dto/admin/admin-upsert-sponsor.dto';

@Injectable()
export class SponsorsService {
  constructor(private readonly sponsors: SponsorRepository) {}

  create(dto: AdminUpsertSponsorDto) {
    return this.sponsors.create({
      fullName: dto.fullName,
      sponsorIdFileUrl: dto.sponsorIdFileUrl ?? null,
      phone: dto.phone ?? null
    });
  }

  async update(id: string, dto: AdminUpsertSponsorDto) {
    const existing = await this.sponsors.findById(id);
    if (!existing) throw new NotFoundException('Sponsor not found');

    return this.sponsors.update(id, {
      fullName: dto.fullName,
      sponsorIdFileUrl: dto.sponsorIdFileUrl ?? null,
      phone: dto.phone ?? null
    });
  }
}
