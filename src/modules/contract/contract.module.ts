import { Module } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ContractService } from './services/contract.service';
import { AdminContractsController } from './presentation/admin-contracts.controller';
import { ContractRepository } from './repositories/contract.repository';
import { ContractPrismaRepository } from './prisma/contract.prisma-repository';

@Module({
  controllers: [AdminContractsController],
  providers: [
    PrismaService,
    ContractService,
    {
      provide: ContractRepository,
      useClass: ContractPrismaRepository,
    },
  ],
  exports: [ContractService],
})
export class ContractModule {}
