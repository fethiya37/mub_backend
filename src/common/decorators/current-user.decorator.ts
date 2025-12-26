import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUser = {
  userId: string;
  email?: string | null;
  phone?: string | null;
  roles: string[];
  permissions: string[];
  isActive: boolean;
  applicantVerified: boolean;
  tokenVersion: number;
};

export const CurrentUserDecorator = createParamDecorator((_: unknown, ctx: ExecutionContext): CurrentUser => {
  const req = ctx.switchToHttp().getRequest();
  return req.user;
});
