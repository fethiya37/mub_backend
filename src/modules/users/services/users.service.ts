import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

function mapUser(u: any) {
  const roles = Array.isArray(u?.userRoles) ? u.userRoles.map((ur: any) => ur.role?.name).filter(Boolean) : [];
  return {
    id: u.id,
    email: u.email,
    phone: u.phone,
    fullName: u.fullName ?? null,
    status: u.status,
    isActive: u.isActive,
    applicantVerified: u.applicantVerified,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
    roles
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  async list(page = 1, pageSize = 50) {
    const r = await this.users.list(page, pageSize);
    return { items: r.items.map(mapUser), total: r.total };
  }

  async get(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return mapUser(user);
  }

  async update(id: string, input: {
    email?: string | null;
    phone?: string;
    fullName?: string | null;
    status?: 'PENDING' | 'APPROVED' | 'REJECTED';
    isActive?: boolean;
    applicantVerified?: boolean;
  }) {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.users.update(id, input);
    return mapUser(updated);
  }

  async updateStatus(id: string, status: 'PENDING' | 'APPROVED' | 'REJECTED') {
    const existing = await this.users.findById(id);
    if (!existing) throw new NotFoundException('User not found');

    const updated = await this.users.update(id, { status });
    return mapUser(updated);
  }

  async setActive(id: string, isActive: boolean) {
    await this.users.setActive(id, isActive);
    return { ok: true };
  }

  async bumpTokenVersion(id: string) {
    await this.users.bumpTokenVersion(id);
  }
}
