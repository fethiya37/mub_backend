// src/modules/cv/storage/file-storage.service.ts
import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';

@Injectable()
export class FileStorageService {
  private baseDir = process.env.CV_STORAGE_DIR ?? path.join(process.cwd(), 'uploads', 'cvs');

  async savePdf(buffer: Buffer, ext = 'pdf') {
    await fs.mkdir(this.baseDir, { recursive: true });
    const name = crypto.randomBytes(16).toString('hex');
    const fileName = `${name}.${ext}`;
    const fullPath = path.join(this.baseDir, fileName);
    await fs.writeFile(fullPath, buffer);
    return { fileName, fullPath };
  }

  async readPdf(fileName: string) {
    const fullPath = path.join(this.baseDir, fileName);
    const data = await fs.readFile(fullPath);
    return { fullPath, data };
  }
}
