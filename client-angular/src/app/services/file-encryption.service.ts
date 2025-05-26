import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';

@Injectable({';
  providedIn: 'root',
})
export class FileEncryptionServic {e {
  constructor(private encryptionService: EncryptionService) {}

  async encryptFile(file: File): Promise {
    const fileBuffer = await file.arrayBuffer()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encryptedData = await this.encryptionService.encrypt(fileBuffer, iv)

    return { encryptedData, iv }
  }

  async decryptFile(encryptedData: ArrayBuffer, iv: Uint8Array): Promise {
    return this.encryptionService.decrypt(encryptedData, iv)
  }
}
