import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync, unlink } from 'fs';
import { extname, join, normalize } from 'path';
import type { Request } from 'express';

export function ensureDir(dirAbsPath: string) {
  if (!existsSync(dirAbsPath)) mkdirSync(dirAbsPath, { recursive: true });
}

export function safeExt(originalName: string) {
  const ext = extname(originalName || '').toLowerCase();
  const ok = ['.png', '.jpg', '.jpeg', '.webp', '.pdf'];
  if (!ok.includes(ext)) throw new BadRequestException(`Unsupported file type: ${ext || 'unknown'}`);
  return ext;
}

export function buildUploadsRoot() {
  const base = process.env.UPLOAD_DIR?.trim() || 'uploads';
  const abs = join(process.cwd(), base);
  ensureDir(abs);
  return abs;
}

export function buildPublicUrl(req: Request, relativePath: string) {
  const baseUrl = process.env.APP_BASE_URL?.trim() || `${req.protocol}://${req.get('host')}`;
  const normalized = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  return `${baseUrl}${normalized}`;
}

export function maxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_MB || 10);
  return Math.max(1, mb) * 1024 * 1024;
}

export function toAbsoluteUploadPath(relativePath: string) {
  const root = buildUploadsRoot();
  const p = normalize(relativePath || '');
  const clean = p.startsWith('/uploads/') ? p.slice('/uploads/'.length) : p.replace(/^\/+/, '');
  return join(root, clean);
}

export async function safeDeleteUploadByRelativePath(relativePath?: string | null) {
  if (!relativePath) return;

  const p = normalize(relativePath);
  if (!p.startsWith('/uploads/')) return;

  const abs = toAbsoluteUploadPath(p);

  await new Promise<void>((resolve) => {
    unlink(abs, () => resolve()); 
  });
}
