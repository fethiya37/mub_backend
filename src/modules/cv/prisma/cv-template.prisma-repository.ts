// src/modules/cv/prisma/cv-template.prisma-repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { CvTemplateCreate, CvTemplateRepository } from '../repositories/cv-template.repository';

@Injectable()
export class CvTemplatePrismaRepository extends CvTemplateRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  create(input: CvTemplateCreate) {
    return this.prisma.cvTemplate.create({ data: input as any });
  }

  update(id: string, patch: Partial<CvTemplateCreate>) {
    return this.prisma.cvTemplate.update({ where: { id }, data: patch as any });
  }

  async delete(id: string) {
    await this.prisma.cvTemplate.delete({ where: { id } });
  }

  findById(id: string) {
    return this.prisma.cvTemplate.findUnique({ where: { id } });
  }

  listActive() {
    return this.prisma.cvTemplate.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  }

  findDefaultActive() {
    return this.prisma.cvTemplate.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
  }
}
