import { Module } from '@nestjs/common';
import { AuditService } from './services/audit.service';
import { AdminAuditController } from './presentation/admin-audit.controller';
import { AuditLogRepository } from './repositories/audit-log.repository';
import { AuditLogPrismaRepository } from './prisma/audit-log.prisma-repository';

@Module({
  controllers: [AdminAuditController],
  providers: [
    AuditService,
    { provide: AuditLogRepository, useClass: AuditLogPrismaRepository }
  ],
  exports: [AuditService]
})
export class AuditModule {}
