import { BadRequestException } from '@nestjs/common';
import { Transform, plainToInstance } from 'class-transformer';

type Ctor<T> = new (...args: any[]) => T;

export function ToNumber() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return value;
    const n = Number(value);
    return Number.isNaN(n) ? value : n;
  });
}

export function ToInt() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'number') return Math.trunc(value);
    const n = Number(value);
    return Number.isNaN(n) ? value : Math.trunc(n);
  });
}

export function ToBoolean() {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;

    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true' || v === '1' || v === 'yes') return true;
      if (v === 'false' || v === '0' || v === 'no') return false;
    }

    return value;
  });
}

export function JsonArrayOf<T>(
  cls: Ctor<T>,
  opts?: { fieldName?: string; allowSingleObject?: boolean }
) {
  const fieldName = opts?.fieldName ?? 'value';
  const allowSingleObject = opts?.allowSingleObject ?? false;

  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;

    let parsed: any = value;

    if (typeof value === 'string') {
      const raw = value.trim();
      if (raw.startsWith('[') || raw.startsWith('{')) {
        try {
          parsed = JSON.parse(raw);
        } catch (e: any) {
          throw new BadRequestException(
            `${fieldName} must be valid JSON. ${e?.message ?? ''}`.trim()
          );
        }
      } else {
        throw new BadRequestException(`${fieldName} must be a JSON array`);
      }
    }

    if (allowSingleObject && parsed && !Array.isArray(parsed) && typeof parsed === 'object') {
      parsed = [parsed];
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException(`${fieldName} must be a JSON array`);
    }

    return plainToInstance(cls, parsed);
  });
}
