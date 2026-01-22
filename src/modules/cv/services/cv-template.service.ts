import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CvTemplateRepository } from '../repositories/cv-template.repository';

@Injectable()
export class CvTemplateService {
  constructor(private readonly templates: CvTemplateRepository) {}

  listActive() {
    return this.templates.listActive();
  }

  async getDefaultActive() {
    const t = await this.templates.findDefaultActive();
    if (!t) throw new BadRequestException('No active CV template configured');
    return t;
  }

  async create(adminId: string, dto: any) {
    return this.templates.create({
      name: dto.name,
      description: dto.description ?? null,
      htmlTemplate: dto.htmlTemplate,
      cssStyle: dto.cssStyle ?? null,
      isActive: dto.isActive ?? true,
      createdBy: adminId
    });
  }

  async update(id: string, dto: any) {
    const existing = await this.templates.findById(id);
    if (!existing) throw new NotFoundException('Template not found');

    return this.templates.update(id, {
      name: dto.name ?? undefined,
      description: dto.description ?? undefined,
      htmlTemplate: dto.htmlTemplate ?? undefined,
      cssStyle: dto.cssStyle ?? undefined,
      isActive: dto.isActive ?? undefined
    });
  }

  async delete(id: string) {
    const existing = await this.templates.findById(id);
    if (!existing) throw new NotFoundException('Template not found');
    await this.templates.delete(id);
    return { ok: true };
  }

  async get(id: string) {
    const t = await this.templates.findById(id);
    if (!t) throw new NotFoundException('Template not found');
    return t;
  }
}
