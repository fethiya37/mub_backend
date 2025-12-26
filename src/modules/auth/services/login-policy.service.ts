import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../users/repositories/user.repository';

@Injectable()
export class LoginPolicyService {
  constructor(private readonly users: UserRepository) {}

  ensureNotLocked(user: { id: string; lockUntil: Date | null }) {
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      throw new UnauthorizedException('Account temporarily locked');
    }
  }

  async onFailedLogin(user: { id: string; failedLoginCount: number }) {
    const next = (user.failedLoginCount ?? 0) + 1;
    const lockUntil = next >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
    await this.users.update(user.id, { failedLoginCount: next, lockUntil });
  }

  async onSuccessfulLogin(userId: string) {
    await this.users.update(userId, { failedLoginCount: 0, lockUntil: null });
  }
}
