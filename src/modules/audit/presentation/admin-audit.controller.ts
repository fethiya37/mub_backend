import { Controller, Get, Query } from '@nestjs/common';
import { RequirePermissions } from '../../../common/decorators/require-permissions.decorator';
import { AuditService } from '../services/audit.service';

@Controller('api/admin/audit')
export class AdminAuditController {
  constructor(private readonly audit: AuditService) {}

  @RequirePermissions('AUDIT_VIEW')
  @Get()
  list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.audit.list(page ? Number(page) : 1, pageSize ? Number(pageSize) : 50);
  }
}
