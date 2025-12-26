import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantSkillRepository } from '../repositories/applicant-skill.repository';

@Injectable()
export class ApplicantSkillPrismaRepository extends ApplicantSkillRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  add(applicantId: string, input: any) {
    return this.prisma.applicantSkill.create({
      data: {
        applicantId,
        skillName: input.skillName,
        proficiencyLevel: input.proficiencyLevel ?? null,
        yearsOfExperience: input.yearsOfExperience ?? null
      }
    });
  }

  update(id: string, input: any) {
    return this.prisma.applicantSkill.update({ where: { id }, data: input });
  }

  async remove(id: string) {
    await this.prisma.applicantSkill.delete({ where: { id } });
  }
}
