import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from '../../users/repositories/user.repository';
import { PermissionEvaluatorService } from '../../rbac/services/permission-evaluator.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly users: UserRepository,
    private readonly evaluator: PermissionEvaluatorService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_ACCESS_SECRET
    });
  }

  async validate(payload: any) {
    const userId = payload.sub as string;
    const tokenVersion = payload.tv as number;

    const user = await this.users.findById(userId);
    if (!user || !user.isActive) throw new UnauthorizedException('Unauthorized');
    if (user.tokenVersion !== tokenVersion) throw new UnauthorizedException('Unauthorized');

    const { roles, permissions } = await this.evaluator.getUserRolesAndPermissions(userId);

    return {
      userId,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      applicantVerified: user.applicantVerified,
      tokenVersion: user.tokenVersion,
      roles,
      permissions
    };
  }
}
