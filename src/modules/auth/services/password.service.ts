import { BadRequestException, Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  async hash(password: string) {
    this.ensureStrong(password);
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  ensureStrong(password: string) {
    if (!password || password.length < 8) throw new BadRequestException('Password too short');
  }
}
