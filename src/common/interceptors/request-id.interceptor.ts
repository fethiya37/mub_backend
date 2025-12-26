import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { randomUUID } from 'crypto';
import { AUDIT } from '../constants/audit.constants';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const id = req.headers[AUDIT.REQUEST_ID_HEADER] || randomUUID();
    req.requestId = id;
    res.setHeader(AUDIT.REQUEST_ID_HEADER, id);
    return next.handle();
  }
}
