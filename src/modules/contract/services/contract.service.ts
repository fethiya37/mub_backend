import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ContractRepository } from '../repositories/contract.repository';
import { CreateContractDto } from '../dto/admin/create-contract.dto';
import { UpdateContractDto } from '../dto/admin/update-contract.dto';
import { PrismaService } from '../../../database/prisma.service';

@Injectable()
export class ContractService {
  constructor(
    private readonly contractRepo: ContractRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createContract(dto: CreateContractDto, contractFileUrl: string) {
    const existingContract = await this.contractRepo.findByVisaCaseId(
      dto.visaCaseId,
    );

    if (existingContract) {
      throw new BadRequestException(
        'Contract already exists for this visa case',
      );
    }

    const visaCase = await this.prisma.visaCase.findUnique({
      where: { id: dto.visaCaseId },
      include: { applicant: true, partner: true },
    });

    if (!visaCase) {
      throw new NotFoundException('Visa case not found');
    }

    const contractNumber = await this.generateContractNumber();

    const contract = await this.contractRepo.create({
      visaCaseId: dto.visaCaseId,
      contractNumber,
      contractFileUrl,
      contractPeriodYears: dto.contractPeriodYears,
      monthlySalary: dto.monthlySalary,
      currency: dto.currency || 'SAR',
      sponsorId: dto.sponsorId,
    });

    await this.prisma.visaCase.update({
      where: { id: dto.visaCaseId },
      data: { status: 'CONTRACT_ISSUED' as any },
    });

    return contract;
  }

  async uploadSignedContract(contractId: string, signedFileUrl: string) {
    const contract = await this.contractRepo.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    if (contract.status === 'SIGNED') {
      throw new BadRequestException('Contract already signed');
    }

    const updated = await this.contractRepo.update(contractId, {
      signedFileUrl,
      status: 'SIGNED',
      signedAt: new Date(),
    });

    await this.prisma.visaCase.update({
      where: { id: contract.visaCaseId },
      data: { status: 'CONTRACT_SIGNED' as any },
    });

    return updated;
  }

  async updateContract(contractId: string, dto: UpdateContractDto) {
    const contract = await this.contractRepo.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return this.contractRepo.update(contractId, {
      status: dto.status,
      contractPeriodYears: dto.contractPeriodYears,
      monthlySalary: dto.monthlySalary,
      currency: dto.currency,
      sponsorId: dto.sponsorId,
    });
  }

  async getContractByVisaCase(visaCaseId: string) {
    const contract = await this.contractRepo.findByVisaCaseId(visaCaseId);

    if (!contract) {
      throw new NotFoundException('Contract not found for this visa case');
    }

    return contract;
  }

  async getContractById(contractId: string) {
    const contract = await this.contractRepo.findById(contractId);

    if (!contract) {
      throw new NotFoundException('Contract not found');
    }

    return contract;
  }

  async listContracts(
    filters: { visaCaseId?: string; status?: string },
    page: number,
    pageSize: number,
  ) {
    return this.contractRepo.list(filters, page, pageSize);
  }

  private async generateContractNumber(): Promise<string> {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const count = await this.contractRepo.countByYearMonth(year, month);

    return `CT-${year}${month.toString().padStart(2, '0')}-${(count + 1).toString().padStart(5, '0')}`;
  }
}
