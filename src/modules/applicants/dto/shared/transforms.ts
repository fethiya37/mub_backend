import { Transform } from 'class-transformer';
import { plainToInstance } from 'class-transformer';

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

export function JsonArrayOf<T>(cls: Ctor<T>) {
  return Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;

    const parsed =
      Array.isArray(value)
        ? value
        : typeof value === 'string'
          ? JSON.parse(value)
          : value;

    if (!Array.isArray(parsed)) return parsed;
    return plainToInstance(cls, parsed);
  });
}
