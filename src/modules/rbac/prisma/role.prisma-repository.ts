import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { RoleRepository } from '../repositories/role.repository';

@Injectable()
export class RolePrismaRepository extends RoleRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findByName(name: string) {
    return this.prisma.role.findUnique({ where: { name }, select: { id: true, name: true } });
  }

  async list() {
    return this.prisma.role.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, description: true } });
  }
}
