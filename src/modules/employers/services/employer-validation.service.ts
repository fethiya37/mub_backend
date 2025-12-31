import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class EmployerValidationService {
  ensureLicenseExpiry(licenseExpiry: Date | null | undefined) {
    if (!licenseExpiry) return;
    if (licenseExpiry.getTime() <= Date.now()) throw new BadRequestException('License expiry must be in the future');
  }
}
