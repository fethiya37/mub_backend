import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { UserCreateInput, UserRepository, UserUpdateInput } from '../repositories/user.repository';

@Injectable()
export class UserPrismaRepository extends UserRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: { include: { role: true } } }
    });
  }

  async findByIdentifier(identifier: string) {
    const where = identifier.includes('@') ? { email: identifier } : { phone: identifier };
    return this.prisma.user.findUnique({
      where,
      include: { userRoles: { include: { role: true } } }
    });
  }

  async create(input: UserCreateInput) {
    return this.prisma.user.create({
      data: {
        email: input.email ?? null,
        phone: input.phone,
        passwordHash: input.passwordHash,
        isActive: input.isActive,
        fullName: input.fullName ?? null,
        status: (input.status as any) ?? 'PENDING',
        tokenVersion: typeof input.tokenVersion === 'number' ? input.tokenVersion : 0,
        failedLoginCount: typeof input.failedLoginCount === 'number' ? input.failedLoginCount : 0,
        lockUntil: input.lockUntil ?? null,
        emailVerified: typeof input.emailVerified === 'boolean' ? input.emailVerified : false,
        emailVerifiedAt: input.emailVerifiedAt ?? null
      },
      include: { userRoles: { include: { role: true } } }
    });
  }

  async update(id: string, input: UserUpdateInput) {
    const data: any = {};

    if ('email' in input) data.email = input.email ?? null;
    if ('phone' in input) data.phone = input.phone;
    if ('passwordHash' in input) data.passwordHash = input.passwordHash;

    if ('isActive' in input) data.isActive = input.isActive;

    if ('fullName' in input) data.fullName = input.fullName ?? null;
    if ('status' in input) data.status = input.status as any;

    if ('failedLoginCount' in input) data.failedLoginCount = input.failedLoginCount;
    if ('lockUntil' in input) data.lockUntil = input.lockUntil ?? null;
    if ('tokenVersion' in input) data.tokenVersion = input.tokenVersion;

    if ('emailVerified' in input) data.emailVerified = input.emailVerified;
    if ('emailVerifiedAt' in input) data.emailVerifiedAt = input.emailVerifiedAt ?? null;

    return this.prisma.user.update({
      where: { id },
      data,
      include: { userRoles: { include: { role: true } } }
    });
  }

  async list(page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
        include: { userRoles: { include: { role: true } } }
      }),
      this.prisma.user.count()
    ]);

    return { items, total };
  }

  async bumpTokenVersion(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { tokenVersion: { increment: 1 } }
    });
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: { isActive, tokenVersion: { increment: 1 } }
    });
  }
}
