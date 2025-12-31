import { BadRequestException, Injectable } from '@nestjs/common';
import { randomToken, sha256 } from '../../../common/utils/crypto.util';
import { AccountActionTokenRepository } from '../repositories/account-action-token.repository';

export type AccountActionType = 'ACCOUNT_SETUP' | 'PASSWORD_RESET' | 'EMAIL_VERIFY';

@Injectable()
export class AccountActionTokensService {
  constructor(private readonly repo: AccountActionTokenRepository) {}

  async issue(userId: string, type: AccountActionType, expiresAt: Date) {
    const raw = randomToken(48);
    const tokenHash = sha256(raw);

    await this.repo.create({ userId, type, tokenHash, expiresAt });

    return raw;
  }

  async consume(rawToken: string, expectedType: AccountActionType) {
    const tokenHash = sha256(rawToken);
    const token = await this.repo.findByTokenHash(tokenHash);

    if (!token) throw new BadRequestException('Invalid token');
    if (token.type !== expectedType) throw new BadRequestException('Invalid token type');
    if (token.usedAt) throw new BadRequestException('Token already used');
    if (token.expiresAt.getTime() <= Date.now()) throw new BadRequestException('Token expired');

    await this.repo.markUsed(token.id);
    return token;
  }

  async invalidateAllForUser(userId: string, type: AccountActionType) {
    await this.repo.invalidateAllForUser(userId, type);
  }
}
