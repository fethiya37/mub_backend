import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserCreateInput, UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserPrismaRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByIdentifier(identifier: string) {
    const where = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    return this.prisma.user.findUnique({ where });
  }

  async create(input: UserCreateInput) {
    return this.prisma.user.create({
      data: {
        email: input.email ?? null,
        phone: input.phone,
        passwordHash: input.passwordHash,
        isActive: input.isActive,
        applicantVerified: input.applicantVerified
      }
    });
  }

  async update(id: string, input: any) {
    return this.prisma.user.update({ where: { id }, data: input });
  }

  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        select: {
          id: true,
          email: true,
          phone: true,
          isActive: true,
          applicantVerified: true,
          createdAt: true,
          updatedAt: true
        }
      }),
      this.prisma.user.count()
    ]);
    return { items, total };
  }

  async bumpTokenVersion(id: string): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.prisma.user.update({ where: { id }, data: { isActive, tokenVersion: { increment: 1 } } });
  }
}
