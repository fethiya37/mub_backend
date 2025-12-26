import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import crypto from 'crypto';

@Injectable()
export class TokenService {
  constructor(private readonly jwt: JwtService) {}

  signAccessToken(input: { userId: string; tokenVersion: number }) {
    const secret = process.env.JWT_ACCESS_SECRET as string;
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN_SECONDS ? Number(process.env.JWT_ACCESS_EXPIRES_IN_SECONDS) : 900;
    const payload = { sub: input.userId, tv: input.tokenVersion };
    const accessToken = this.jwt.sign(payload, { secret, expiresIn });
    return { accessToken, expiresInSeconds: expiresIn };
  }

  generateRefreshToken() {
    const token = crypto.randomBytes(48).toString('base64url');
    const jti = crypto.randomBytes(16).toString('base64url');
    return { token, jti };
  }

  hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
