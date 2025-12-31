import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import crypto from 'crypto';
import { ApplicantDraftTokenService } from '../services/applicant-draft-token.service';

@Injectable()
export class DraftTokenGuard implements CanActivate {
  constructor(private readonly draftTokens: ApplicantDraftTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { applicantId?: string; draftTokenRecordId?: string }>();

    const raw = String(req.headers['x-draft-token'] ?? '').trim();
    if (!raw) throw new UnauthorizedException('Missing Draft token');

    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const record = await this.draftTokens.getValidRecord(tokenHash);
    if (!record) throw new UnauthorizedException('Invalid or expired Draft token');

    req.applicantId = record.applicantId;
    req.draftTokenRecordId = record.id;
    return true;
  }
}
