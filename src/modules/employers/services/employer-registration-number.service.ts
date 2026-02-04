import { Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class EmployerRegistrationNumberService {
  generate(country: string) {
    const cc = (country || 'XX')
      .replace(/[^A-Za-z]/g, '')
      .slice(0, 2)
      .toUpperCase()
      .padEnd(2, 'X');

    const date = new Date();
    const y = String(date.getUTCFullYear());
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');

    const rnd = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `PAR-${cc}-${y}${m}${d}-${rnd}`;
  }
}
