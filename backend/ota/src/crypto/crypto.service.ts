import { Inject, Injectable } from '@nestjs/common';
import crypto from 'crypto';

@Injectable()
export class CryptoService {
  constructor(@Inject('KEY') private readonly key: Buffer) {}

  crypto(payload: Buffer) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-cbc', this.key, iv);
    let encrypted = cipher.update(payload);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const encryptedArr = new Uint8Array(encrypted);
    return { iv, encryptedArr };
  }
}
