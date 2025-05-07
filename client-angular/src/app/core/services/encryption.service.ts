// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the encryption service
//
// COMMON CUSTOMIZATIONS:
// - KEY_STORAGE_PREFIX: Prefix for keys stored in localStorage (default: 'chat_keys_')
// - ENABLE_ENCRYPTION: Enable end-to-end encryption (default: true)
// - KEY_PAIR_ALGORITHM: Algorithm used for key pair generation (default: 'RSA-OAEP')
// - MESSAGE_AUTO_DELETION: Enable automatic message deletion (default: true)
// - DEFAULT_MESSAGE_TTL: Default time-to-live for messages in milliseconds (default: 7 days)
// ===================================================

import { Injectable } from '@angular/core';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  expiresAt?: number;
}

export interface EncryptedAttachmentData {
  file: Blob;
  metadata: {
    originalName: string;
    originalType: string;
    size: number;
    iv: string;
    authTag: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private initialized = false;
  private roomKeys = new Map<string, CryptoKey>();
  private messageExpirySettings = new Map<string, { enabled: boolean; ttl: number }>();

  constructor() {}

  /**
   * Initialize the encryption service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // Check if the browser supports the required crypto APIs
      if (!window.crypto || !window.crypto.subtle) {
        console.warn('Web Crypto API not supported');
        return false;
      }

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing encryption service:', error);
      return false;
    }
  }

  /**
   * Check if encryption is available
   */
  isEncryptionAvailable(): boolean {
    return this.initialized;
  }

  /**
   * Get message expiry settings for a room
   */
  getMessageExpirySettings(roomId: string): { enabled: boolean; ttl: number } {
    return (
      this.messageExpirySettings.get(roomId) || {
        enabled: false,
        ttl: 7 * 24 * 60 * 60 * 1000, // 7 days default
      }
    );
  }

  /**
   * Set message expiry settings for a room
   */
  setMessageExpirySettings(roomId: string, settings: { enabled: boolean; ttl: number }): void {
    this.messageExpirySettings.set(roomId, settings);
  }

  /**
   * Encrypt a file
   */
  async encryptFile(roomId: string, file: File): Promise<EncryptedAttachmentData | null> {
    try {
      // Get room key
      const key = await this.getRoomKey(roomId);
      if (!key) throw new Error('Room key not available');

      // Read file as ArrayBuffer
      const fileBuffer = await file.arrayBuffer();

      // Generate IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the file
      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128,
        },
        key,
        fileBuffer,
      );

      // Extract auth tag (last 16 bytes)
      const encryptedArray = new Uint8Array(encryptedData);
      const authTag = encryptedArray.slice(encryptedArray.length - 16);
      const ciphertext = encryptedArray.slice(0, encryptedArray.length - 16);

      // Create encrypted file blob
      const encryptedFile = new Blob([ciphertext], { type: 'application/octet-stream' });

      return {
        file: encryptedFile,
        metadata: {
          originalName: file.name,
          originalType: file.type,
          size: file.size,
          iv: this.arrayBufferToBase64(iv),
          authTag: this.arrayBufferToBase64(authTag),
        },
      };
    } catch (error) {
      console.error('Error encrypting file:', error);
      return null;
    }
  }

  /**
   * Decrypt a file
   */
  async decryptFile(roomId: string, encryptedData: EncryptedAttachmentData): Promise<File | null> {
    try {
      // Get room key
      const key = await this.getRoomKey(roomId);
      if (!key) throw new Error('Room key not available');

      // Convert encrypted file to ArrayBuffer
      const encryptedBuffer = await encryptedData.file.arrayBuffer();

      // Decrypt the file
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: this.base64ToArrayBuffer(encryptedData.metadata.iv),
          tagLength: 128,
        },
        key,
        encryptedBuffer,
      );

      // Create decrypted file
      return new File([decryptedBuffer], encryptedData.metadata.originalName, {
        type: encryptedData.metadata.originalType,
      });
    } catch (error) {
      console.error('Error decrypting file:', error);
      return null;
    }
  }

  /**
   * Get or generate a room key
   */
  private async getRoomKey(roomId: string): Promise<CryptoKey | null> {
    try {
      // Check if we already have the key
      if (this.roomKeys.has(roomId)) {
        return this.roomKeys.get(roomId)!;
      }

      // Generate a new key
      const key = await window.crypto.subtle.generateKey(
        {
          name: 'AES-GCM',
          length: 256,
        },
        true,
        ['encrypt', 'decrypt'],
      );

      // Store the key
      this.roomKeys.set(roomId, key);

      return key;
    } catch (error) {
      console.error('Error getting room key:', error);
      return null;
    }
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  /**
   * Convert Base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Encrypt a message
   */
  async encryptMessage(
    roomId: string,
    content: string,
    ttl?: number,
  ): Promise<EncryptedData | null> {
    try {
      const key = await this.getRoomKey(roomId);
      if (!key) throw new Error('Room key not available');

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedContent = new TextEncoder().encode(content);

      const encryptedData = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128,
        },
        key,
        encodedContent,
      );

      // Extract auth tag (last 16 bytes)
      const encryptedArray = new Uint8Array(encryptedData);
      const authTag = encryptedArray.slice(encryptedArray.length - 16);
      const ciphertext = encryptedArray.slice(0, encryptedArray.length - 16);

      return {
        ciphertext: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        authTag: this.arrayBufferToBase64(authTag),
        expiresAt: ttl ? Date.now() + ttl : undefined,
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      return null;
    }
  }

  /**
   * Decrypt a message
   */
  async decryptMessage(roomId: string, encryptedData: EncryptedData): Promise<string | null> {
    try {
      const key = await this.getRoomKey(roomId);
      if (!key) throw new Error('Room key not available');

      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);
      const authTag = this.base64ToArrayBuffer(encryptedData.authTag);

      // Combine ciphertext and auth tag
      const encryptedArray = new Uint8Array(ciphertext.byteLength + authTag.byteLength);
      encryptedArray.set(new Uint8Array(ciphertext), 0);
      encryptedArray.set(new Uint8Array(authTag), ciphertext.byteLength);

      const decryptedData = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
          tagLength: 128,
        },
        key,
        encryptedArray,
      );

      return new TextDecoder().decode(decryptedData);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return null;
    }
  }
}
