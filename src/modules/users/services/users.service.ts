import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  async list(page = 1, pageSize = 50) {
    return this.users.list(page, pageSize);
  }

  async get(id: string) {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async setActive(id: string, isActive: boolean) {
    await this.users.setActive(id, isActive);
    return { ok: true };
  }

  async bumpTokenVersion(id: string) {
    await this.users.bumpTokenVersion(id);
  }
}
