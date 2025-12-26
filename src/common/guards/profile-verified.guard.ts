import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class ProfileVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user as any;
    if (user?.roles?.includes('APPLICANT') && user?.applicantVerified !== true) {
      throw new ForbiddenException('Applicant profile not verified');
    }
    return true;
  }
}
