import { Injectable } from '@nestjs/common';
import fs from 'fs/promises';
import crypto from 'crypto';
import { fileDto } from './dto/file.dto';

@Injectable()
export class FileService {
  static files = new Map<string, fileDto>();

  static async get(filePath: string) {
    if (!this.files.has(filePath)) {
      const buf = await fs.readFile(filePath);
      const hash = crypto.createHash('sha256').update(buf).digest('hex');
      this.files.set(filePath, {
        buffer: buf,
        hash: hash,
        refCnt: 0,
      });
    }
    return this.files.get(filePath);
  }

  static release(filePath: string) {
    const file = this.files.get(filePath);
    if (!file) return;
    file.refCnt--;
    if (file.refCnt == 0) this.files.delete(filePath);
  }
  static slice(buf: Buffer, index: number, size: number) {
    return buf.subarray(index * size, index * size + size);
  }
}
