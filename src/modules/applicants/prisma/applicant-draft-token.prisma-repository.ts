import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { ApplicantDraftTokenRepository } from '../repositories/applicant-draft-token.repository';

@Injectable()
export class ApplicantDraftTokenPrismaRepository extends ApplicantDraftTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async invalidateAll(applicantId: string) {
    await this.prisma.applicantDraftToken.updateMany({
      where: { applicantId, usedAt: null },
      data: { usedAt: new Date() }
    });
  }

  create(applicantId: string, tokenHash: string, expiresAt: Date) {
    return this.prisma.applicantDraftToken.create({
      data: { applicantId, tokenHash, expiresAt }
    });
  }

  findValidByHash(tokenHash: string) {
    return this.prisma.applicantDraftToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } },
      include: { applicant: true }
    });
  }

  async markUsed(id: string) {
    await this.prisma.applicantDraftToken.update({ where: { id }, data: { usedAt: new Date() } });
  }
}
