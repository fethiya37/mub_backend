import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { AccountActionTokenCreate, AccountActionTokenRepository } from '../repositories/account-action-token.repository';

@Injectable()
export class AccountActionTokenPrismaRepository extends AccountActionTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: AccountActionTokenCreate): Promise<void> {
    await this.prisma.accountActionToken.create({ data: input as any });
  }

  async findByTokenHash(tokenHash: string) {
    return this.prisma.accountActionToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.accountActionToken.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async invalidateAllForUser(userId: string, type: AccountActionTokenCreate['type']): Promise<void> {
    await this.prisma.accountActionToken.updateMany({
      where: { userId, type: type as any, usedAt: null },
      data: { usedAt: new Date() }
    });
  }
}
