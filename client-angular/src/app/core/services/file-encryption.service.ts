import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root',
})
export class FileEncryptionService {
  constructor(private encryptionService: EncryptionService) {}

  async encryptFile(file: File): Promise<{ encryptedData: ArrayBuffer; iv: Uint8Array }> {
    const fileBuffer = await file.arrayBuffer();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await this.encryptionService.encrypt(fileBuffer, iv);

    return { encryptedData, iv };
  }

  async decryptFile(encryptedData: ArrayBuffer, iv: Uint8Array): Promise<ArrayBuffer> {
    return this.encryptionService.decrypt(encryptedData, iv);
  }
}
