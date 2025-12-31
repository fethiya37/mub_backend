import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployerRepository } from '../repositories/employer.repository';
import { AuditService } from '../../audit/services/audit.service';
import { EmployerRegistrationNumberService } from './employer-registration-number.service';
import { EmployerValidationService } from './employer-validation.service';
import type { EmployerRegisterDto } from '../dto/employer-register.dto';
import type { AdminCreateEmployerDto } from '../dto/admin/admin-create-employer.dto';

@Injectable()
export class EmployersService {
  constructor(
    private readonly employers: EmployerRepository,
    private readonly audit: AuditService,
    private readonly regNo: EmployerRegistrationNumberService,
    private readonly validation: EmployerValidationService
  ) {}

  async register(dto: EmployerRegisterDto) {
    await this.ensureUnique(dto);

    const licenseExpiry = dto.licenseExpiry ? new Date(dto.licenseExpiry) : null;
    this.validation.ensureLicenseExpiry(licenseExpiry);

    const employer = await this.createWithGeneratedRegNo({
      organizationName: dto.organizationName,
      country: dto.country,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      address: dto.address ?? null,

      ownerName: dto.ownerName,
      ownerIdNumber: dto.ownerIdNumber,
      licenseNumber: dto.licenseNumber,
      licenseFileUrl: dto.licenseFileUrl,
      licenseExpiry,

      createdBy: 'EMPLOYER'
    });

    await this.audit.log({
      performedBy: null,
      action: 'EMPLOYER_REGISTERED',
      entityType: 'Employer',
      entityId: employer.id
    });

    return employer;
  }

  async adminCreate(dto: AdminCreateEmployerDto, performedBy: string) {
    await this.ensureUnique(dto);

    const licenseExpiry = dto.licenseExpiry ? new Date(dto.licenseExpiry) : null;
    this.validation.ensureLicenseExpiry(licenseExpiry);

    const employer = await this.createWithGeneratedRegNo({
      organizationName: dto.organizationName,
      country: dto.country,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
      address: dto.address ?? null,

      ownerName: dto.ownerName,
      ownerIdNumber: dto.ownerIdNumber,
      licenseNumber: dto.licenseNumber,
      licenseFileUrl: dto.licenseFileUrl,
      licenseExpiry,

      createdBy: 'ADMIN'
    });

    await this.audit.log({
      performedBy,
      action: 'EMPLOYER_CREATED_BY_ADMIN',
      entityType: 'Employer',
      entityId: employer.id
    });

    return employer;
  }

  list(filters: { status?: string; country?: string }, page: number, pageSize: number) {
    return this.employers.list(filters, page, pageSize);
  }

  async get(id: string) {
    const employer = await this.employers.findById(id);
    if (!employer) throw new NotFoundException('Employer not found');
    return employer;
  }

  private async ensureUnique(dto: EmployerRegisterDto) {
    const emailExists = await this.employers.findByContactEmail(dto.contactEmail);
    if (emailExists) throw new ConflictException('Employer contact email already exists');

    const phoneExists = await this.employers.findByContactPhone(dto.contactPhone);
    if (phoneExists) throw new ConflictException('Employer contact phone already exists');

    const licenseExists = await this.employers.findByLicenseNumber(dto.licenseNumber);
    if (licenseExists) throw new ConflictException('Employer license number already exists');

    const ownerIdExists = await this.employers.findByOwnerIdNumber(dto.ownerIdNumber);
    if (ownerIdExists) throw new ConflictException('Employer owner ID number already exists');
  }

  private async createWithGeneratedRegNo(input: {
    organizationName: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    address: string | null;

    ownerName: string;
    ownerIdNumber: string;
    licenseNumber: string;
    licenseFileUrl: string;
    licenseExpiry: Date | null;

    createdBy: 'EMPLOYER' | 'ADMIN';
  }) {
    const maxAttempts = 5;

    for (let i = 0; i < maxAttempts; i++) {
      const registrationNumber = this.regNo.generate(input.country);

      try {
        return await this.employers.create({
          ...input,
          registrationNumber
        });
      } catch (e: any) {
        const isUniqueViolation = e?.code === 'P2002';
        if (!isUniqueViolation) throw e;
        if (i === maxAttempts - 1) throw new ConflictException('Failed to generate unique registration number');
      }
    }

    throw new ConflictException('Failed to create employer');
  }
}
