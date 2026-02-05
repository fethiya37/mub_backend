import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.skill.findMany({ orderBy: { name: 'asc' } });
  }

  async create(name: string) {
    const trimmed = name.trim();
    if (!trimmed) throw new BadRequestException('Skill name is required');

    const existing = await this.prisma.skill.findUnique({ where: { name: trimmed } });
    if (existing) throw new ConflictException('Skill already exists');

    return this.prisma.skill.create({ data: { name: trimmed } });
  }

  async update(skillId: string, dto: { name?: string }) {
    const existing = await this.prisma.skill.findUnique({ where: { id: skillId } });
    if (!existing) throw new NotFoundException('Skill not found');

    const data: any = {};
    if (dto.name !== undefined) {
      const trimmed = dto.name.trim();
      if (!trimmed) throw new BadRequestException('Skill name is required');
      data.name = trimmed;
    }

    return this.prisma.skill.update({ where: { id: skillId }, data });
  }
}
