import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RBAC } from '../constants/rbac.constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(RBAC.PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass()
    ]);
    if (!required || required.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user as any;

    if (!user) throw new ForbiddenException('Forbidden');
    if (user.roles?.includes('ADMIN')) return true;

    const perms: string[] = user.permissions ?? [];
    const ok = required.every((p) => perms.includes(p));
    if (!ok) throw new ForbiddenException('Forbidden');
    return true;
  }
}
