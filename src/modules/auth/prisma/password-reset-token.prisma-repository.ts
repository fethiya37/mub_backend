import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { PasswordResetCreate, PasswordResetTokenRepository } from '../repositories/password-reset-token.repository';

@Injectable()
export class PasswordResetTokenPrismaRepository extends PasswordResetTokenRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async create(input: PasswordResetCreate): Promise<void> {
    await this.prisma.passwordResetToken.create({ data: input });
  }

  async findValidByTokenHash(tokenHash: string) {
    return this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });
  }

  async markUsed(id: string): Promise<void> {
    await this.prisma.passwordResetToken.update({ where: { id }, data: { usedAt: new Date() } });
  }

  async invalidateAllForUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({ where: { userId, usedAt: null }, data: { usedAt: new Date() } });
  }
}
