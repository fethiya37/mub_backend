import { BadRequestException, Injectable } from '@nestjs/common';
import crypto from 'crypto';
import { ApplicantDraftTokenRepository } from '../repositories/applicant-draft-token.repository';

@Injectable()
export class ApplicantDraftTokenService {
  constructor(private readonly repo: ApplicantDraftTokenRepository) {}

  async rotate(applicantId: string, hours = 24) {
    await this.repo.invalidateAll(applicantId);

    const raw = crypto.randomBytes(48).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000);

    await this.repo.create(applicantId, tokenHash, expiresAt);

    return { draftToken: raw, draftTokenExpiresAt: expiresAt };
  }

  async getValidRecord(tokenHash: string) {
    const record = await this.repo.findValidByHash(tokenHash);
    if (!record) return null;
    return { id: record.id, applicantId: record.applicantId, applicant: record.applicant };
  }

  async markUsed(id: string) {
    await this.repo.markUsed(id);
  }

  parseLaborId(gender: string | null | undefined, laborId: string | null | undefined) {
    if (!gender || !laborId) return;
    const v = String(laborId).trim();
    if (gender === 'MALE') {
      if (!/^EM\d{8}$/.test(v)) throw new BadRequestException('Male laborId must be EM########');
    }
    if (gender === 'FEMALE') {
      if (!/^EF\d{8}$/.test(v)) throw new BadRequestException('Female laborId must be EF########');
    }
  }

  ensurePassportExpiry(passportExpiry: Date | null | undefined) {
    if (!passportExpiry) return;
    if (passportExpiry.getTime() <= Date.now()) throw new BadRequestException('Passport expiry must be in the future');
  }
}
