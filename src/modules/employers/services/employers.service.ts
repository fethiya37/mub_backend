import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { EmployerRepository } from '../repositories/employer.repository';
import { AuditService } from '../../audit/services/audit.service';
import { EmployerRegistrationNumberService } from './employer-registration-number.service';
import { EmployerValidationService } from './employer-validation.service';
import type { EmployerRegisterDto } from '../dto/employer-register.dto';
import type { AdminCreateEmployerDto } from '../dto/admin/admin-create-employer.dto';
import type { AdminUpdateEmployerDto } from '../dto/admin/admin-update-employer.dto';
import type { EmployerSelfUpdateDto } from '../dto/employer/employer-self-update.dto';
import { safeDeleteUploadByRelativePath } from '../../../common/utils/upload/upload.utils';

@Injectable()
export class EmployersService {
  constructor(
    private readonly employers: EmployerRepository,
    private readonly audit: AuditService,
    private readonly regNo: EmployerRegistrationNumberService,
    private readonly validation: EmployerValidationService
  ) {}

  async resolveEmployerRegisterFiles(
    dto: EmployerRegisterDto,
    files: {
      logoFile?: Express.Multer.File;
      ownerIdFile?: Express.Multer.File;
      licenseFile?: Express.Multer.File;
    }
  ): Promise<EmployerRegisterDto> {
    const next: EmployerRegisterDto = { ...dto };

    if (files.logoFile) next.logoUrl = `/uploads/employers/logos/${files.logoFile.filename}`;
    if (files.ownerIdFile) next.ownerIdFileUrl = `/uploads/employers/owners/${files.ownerIdFile.filename}`;
    if (files.licenseFile) next.licenseFileUrl = `/uploads/employers/licenses/${files.licenseFile.filename}`;

    return next;
  }

  async resolveAdminCreateFiles(
    dto: AdminCreateEmployerDto,
    files: {
      logoFile?: Express.Multer.File;
      ownerIdFile?: Express.Multer.File;
      licenseFile?: Express.Multer.File;
    }
  ): Promise<AdminCreateEmployerDto> {
    const next: AdminCreateEmployerDto = { ...dto };

    if (files.logoFile) next.logoUrl = `/uploads/employers/logos/${files.logoFile.filename}`;
    if (files.ownerIdFile) next.ownerIdFileUrl = `/uploads/employers/owners/${files.ownerIdFile.filename}`;
    if (files.licenseFile) next.licenseFileUrl = `/uploads/employers/licenses/${files.licenseFile.filename}`;

    return next;
  }

  async resolveAdminUpdateFiles(
    employerId: string,
    dto: AdminUpdateEmployerDto,
    files: {
      logoFile?: Express.Multer.File;
      ownerIdFile?: Express.Multer.File;
      licenseFile?: Express.Multer.File;
    }
  ): Promise<AdminUpdateEmployerDto> {
    const existing = await this.employers.findById(employerId);
    if (!existing) throw new NotFoundException('Employer not found');

    const next: AdminUpdateEmployerDto = { ...dto };

    if (files.logoFile) next.logoUrl = `/uploads/employers/logos/${files.logoFile.filename}`;
    if (files.ownerIdFile) next.ownerIdFileUrl = `/uploads/employers/owners/${files.ownerIdFile.filename}`;
    if (files.licenseFile) next.licenseFileUrl = `/uploads/employers/licenses/${files.licenseFile.filename}`;

    return next;
  }

  async resolveEmployerSelfUpdateFiles(
    userId: string,
    dto: EmployerSelfUpdateDto,
    files: {
      logoFile?: Express.Multer.File;
      ownerIdFile?: Express.Multer.File;
      licenseFile?: Express.Multer.File;
    }
  ): Promise<EmployerSelfUpdateDto> {
    const employer = await this.employers.findByUserId(userId);
    if (!employer) throw new NotFoundException('Employer not found for user');

    const next: EmployerSelfUpdateDto = { ...dto };

    if (files.logoFile) next.logoUrl = `/uploads/employers/logos/${files.logoFile.filename}`;
    if (files.ownerIdFile) next.ownerIdFileUrl = `/uploads/employers/owners/${files.ownerIdFile.filename}`;
    if (files.licenseFile) next.licenseFileUrl = `/uploads/employers/licenses/${files.licenseFile.filename}`;

    return next;
  }

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

      logoUrl: dto.logoUrl ?? null,

      ownerName: dto.ownerName,
      ownerIdNumber: dto.ownerIdNumber ?? null,
      ownerIdFileUrl: dto.ownerIdFileUrl ?? null,

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

      logoUrl: dto.logoUrl ?? null,

      ownerName: dto.ownerName,
      ownerIdNumber: dto.ownerIdNumber ?? null,
      ownerIdFileUrl: dto.ownerIdFileUrl ?? null,

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

  async adminUpdate(id: string, dto: AdminUpdateEmployerDto, performedBy: string) {
    const existing = await this.employers.findById(id);
    if (!existing) throw new NotFoundException('Employer not found');

    const oldLogoUrl = existing.logoUrl ?? null;
    const oldOwnerIdFileUrl = existing.ownerIdFileUrl ?? null;
    const oldLicenseFileUrl = existing.licenseFileUrl ?? null;

    const nextLicenseNumber = dto.licenseNumber ?? existing.licenseNumber;
    const nextContactEmail = dto.contactEmail ?? existing.contactEmail;
    const nextContactPhone = dto.contactPhone ?? existing.contactPhone;

    const nextOwnerIdNumber = dto.ownerIdNumber === undefined ? existing.ownerIdNumber : dto.ownerIdNumber;

    const nextLicenseExpiry =
      dto.licenseExpiry === undefined
        ? existing.licenseExpiry
        : dto.licenseExpiry
          ? new Date(dto.licenseExpiry)
          : null;

    this.validation.ensureLicenseExpiry(nextLicenseExpiry ?? null);

    if (dto.contactEmail && dto.contactEmail !== existing.contactEmail) {
      const emailExists = await this.employers.findByContactEmail(dto.contactEmail);
      if (emailExists) throw new ConflictException('Employer contact email already exists');
    }

    if (dto.contactPhone && dto.contactPhone !== existing.contactPhone) {
      const phoneExists = await this.employers.findByContactPhone(dto.contactPhone);
      if (phoneExists) throw new ConflictException('Employer contact phone already exists');
    }

    if (dto.licenseNumber && dto.licenseNumber !== existing.licenseNumber) {
      const licenseExists = await this.employers.findByLicenseNumber(dto.licenseNumber);
      if (licenseExists) throw new ConflictException('Employer license number already exists');
    }

    if (dto.ownerIdNumber !== undefined) {
      if (dto.ownerIdNumber) {
        const ownerIdExists = await this.employers.findByOwnerIdNumber(dto.ownerIdNumber);
        if (ownerIdExists && ownerIdExists.id !== existing.id) {
          throw new ConflictException('Employer owner ID number already exists');
        }
      }
    }

    const updated = await this.employers.update(id, {
      organizationName: dto.organizationName ?? existing.organizationName,
      country: dto.country ?? existing.country,
      contactEmail: nextContactEmail,
      contactPhone: nextContactPhone,
      address: dto.address ?? existing.address,

      logoUrl: dto.logoUrl === undefined ? existing.logoUrl : dto.logoUrl,

      ownerName: dto.ownerName ?? existing.ownerName,
      ownerIdNumber: nextOwnerIdNumber ?? null,
      ownerIdFileUrl: dto.ownerIdFileUrl === undefined ? existing.ownerIdFileUrl : dto.ownerIdFileUrl,

      licenseNumber: nextLicenseNumber,
      licenseFileUrl: dto.licenseFileUrl ?? existing.licenseFileUrl,
      licenseExpiry: nextLicenseExpiry ?? null,

      status: dto.status ?? existing.status
    });

    if (dto.logoUrl !== undefined && oldLogoUrl && oldLogoUrl !== updated.logoUrl) {
      await safeDeleteUploadByRelativePath(oldLogoUrl);
    }

    if (dto.ownerIdFileUrl !== undefined && oldOwnerIdFileUrl && oldOwnerIdFileUrl !== updated.ownerIdFileUrl) {
      await safeDeleteUploadByRelativePath(oldOwnerIdFileUrl);
    }

    if (dto.licenseFileUrl !== undefined && oldLicenseFileUrl && oldLicenseFileUrl !== updated.licenseFileUrl) {
      await safeDeleteUploadByRelativePath(oldLicenseFileUrl);
    }

    await this.audit.log({
      performedBy,
      action: 'EMPLOYER_UPDATED_BY_ADMIN',
      entityType: 'Employer',
      entityId: id
    });

    return updated;
  }

  async employerSelfUpdate(userId: string, dto: EmployerSelfUpdateDto) {
    const employer = await this.employers.findByUserId(userId);
    if (!employer) throw new NotFoundException('Employer not found for user');

    const oldLogoUrl = employer.logoUrl ?? null;
    const oldOwnerIdFileUrl = employer.ownerIdFileUrl ?? null;
    const oldLicenseFileUrl = employer.licenseFileUrl ?? null;

    const nextLicenseNumber = dto.licenseNumber ?? employer.licenseNumber;
    const nextContactEmail = dto.contactEmail ?? employer.contactEmail;
    const nextContactPhone = dto.contactPhone ?? employer.contactPhone;

    const nextOwnerIdNumber = dto.ownerIdNumber === undefined ? employer.ownerIdNumber : dto.ownerIdNumber;

    const nextLicenseExpiry =
      dto.licenseExpiry === undefined
        ? employer.licenseExpiry
        : dto.licenseExpiry
          ? new Date(dto.licenseExpiry)
          : null;

    this.validation.ensureLicenseExpiry(nextLicenseExpiry ?? null);

    if (dto.contactEmail && dto.contactEmail !== employer.contactEmail) {
      const emailExists = await this.employers.findByContactEmail(dto.contactEmail);
      if (emailExists && emailExists.id !== employer.id) {
        throw new ConflictException('Employer contact email already exists');
      }
    }

    if (dto.contactPhone && dto.contactPhone !== employer.contactPhone) {
      const phoneExists = await this.employers.findByContactPhone(dto.contactPhone);
      if (phoneExists && phoneExists.id !== employer.id) {
        throw new ConflictException('Employer contact phone already exists');
      }
    }

    if (dto.licenseNumber && dto.licenseNumber !== employer.licenseNumber) {
      const licenseExists = await this.employers.findByLicenseNumber(dto.licenseNumber);
      if (licenseExists && licenseExists.id !== employer.id) {
        throw new ConflictException('Employer license number already exists');
      }
    }

    if (dto.ownerIdNumber !== undefined) {
      if (dto.ownerIdNumber) {
        const ownerIdExists = await this.employers.findByOwnerIdNumber(dto.ownerIdNumber);
        if (ownerIdExists && ownerIdExists.id !== employer.id) {
          throw new ConflictException('Employer owner ID number already exists');
        }
      }
    }

    const updated = await this.employers.update(employer.id, {
      organizationName: dto.organizationName ?? employer.organizationName,
      country: dto.country ?? employer.country,
      contactEmail: nextContactEmail,
      contactPhone: nextContactPhone,
      address: dto.address ?? employer.address,

      logoUrl: dto.logoUrl === undefined ? employer.logoUrl : dto.logoUrl,

      ownerName: dto.ownerName ?? employer.ownerName,
      ownerIdNumber: nextOwnerIdNumber ?? null,
      ownerIdFileUrl: dto.ownerIdFileUrl === undefined ? employer.ownerIdFileUrl : dto.ownerIdFileUrl,

      licenseNumber: nextLicenseNumber,
      licenseFileUrl: dto.licenseFileUrl ?? employer.licenseFileUrl,
      licenseExpiry: nextLicenseExpiry ?? null
    });

    if (dto.logoUrl !== undefined && oldLogoUrl && oldLogoUrl !== updated.logoUrl) {
      await safeDeleteUploadByRelativePath(oldLogoUrl);
    }

    if (dto.ownerIdFileUrl !== undefined && oldOwnerIdFileUrl && oldOwnerIdFileUrl !== updated.ownerIdFileUrl) {
      await safeDeleteUploadByRelativePath(oldOwnerIdFileUrl);
    }

    if (dto.licenseFileUrl !== undefined && oldLicenseFileUrl && oldLicenseFileUrl !== updated.licenseFileUrl) {
      await safeDeleteUploadByRelativePath(oldLicenseFileUrl);
    }

    await this.audit.log({
      performedBy: userId,
      action: 'EMPLOYER_SELF_UPDATED',
      entityType: 'Employer',
      entityId: employer.id
    });

    return updated;
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

    if (dto.ownerIdNumber) {
      const ownerIdExists = await this.employers.findByOwnerIdNumber(dto.ownerIdNumber);
      if (ownerIdExists) throw new ConflictException('Employer owner ID number already exists');
    }
  }

  private async createWithGeneratedRegNo(input: {
    organizationName: string;
    country: string;
    contactEmail: string;
    contactPhone: string;
    address: string | null;

    logoUrl: string | null;

    ownerName: string;
    ownerIdNumber: string | null;
    ownerIdFileUrl: string | null;

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
