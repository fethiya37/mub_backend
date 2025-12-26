import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RefreshTokenCreate, RefreshTokenRepository } from '../repositories/refresh-token.repository';

@Injectable()
export class RefreshTokenPrismaRepository extends RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: RefreshTokenCreate): Promise<void> {
    await this.prisma.refreshToken.create({ data: input });
  }

  async findActiveByJti(jti: string) {
    return this.prisma.refreshToken.findUnique({ where: { jti } });
  }

  async revoke(id: string): Promise<void> {
    await this.prisma.refreshToken.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }
}
