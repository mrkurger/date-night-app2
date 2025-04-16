// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for the encryption service
//
// COMMON CUSTOMIZATIONS:
// - KEY_STORAGE_PREFIX: Prefix for keys stored in localStorage (default: 'chat_keys_')
// - ENABLE_ENCRYPTION: Enable end-to-end encryption (default: true)
// - KEY_PAIR_ALGORITHM: Algorithm used for key pair generation (default: 'RSA-OAEP')
// ===================================================

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Constants
const KEY_STORAGE_PREFIX = 'chat_keys_';
const ENABLE_ENCRYPTION = true;
const KEY_PAIR_ALGORITHM = 'RSA-OAEP';
const SYMMETRIC_ALGORITHM = 'AES-GCM';

export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag?: string;
}

export interface RoomKeys {
  roomId: string;
  symmetricKey: string;
  encryptedSymmetricKey: string;
  publicKeys: { [userId: string]: string };
}

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private readonly apiUrl = environment.apiUrl + '/chat/encryption';
  private keyPair: CryptoKeyPair | null = null;
  private roomKeys: Map<string, CryptoKey> = new Map();
  private isInitialized = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Initialize the encryption service
   * This should be called when the user logs in
   */
  async initialize(): Promise<boolean> {
    if (!ENABLE_ENCRYPTION) {
      console.log('Encryption is disabled');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if we have keys in storage
      const userId = this.authService.getCurrentUserId();
      if (!userId) {
        console.error('User ID not available');
        return false;
      }

      const storedKeys = this.getKeysFromStorage(userId);
      if (storedKeys) {
        // Import the stored keys
        this.keyPair = await this.importKeyPair(storedKeys);
        this.isInitialized = true;
        return true;
      }

      // Generate new keys if none exist
      this.keyPair = await this.generateKeyPair();

      // Export and store the keys
      const exportedKeys = await this.exportKeyPair(this.keyPair);
      this.storeKeys(userId, exportedKeys);

      // Register public key with the server
      await this.registerPublicKey(exportedKeys.publicKey);

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing encryption service:', error);
      return false;
    }
  }

  /**
   * Check if encryption is enabled and initialized
   */
  isEncryptionAvailable(): boolean {
    return ENABLE_ENCRYPTION && this.isInitialized;
  }

  /**
   * Generate a new key pair for asymmetric encryption
   */
  private async generateKeyPair(): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey(
      {
        name: KEY_PAIR_ALGORITHM,
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Export a key pair to string format
   */
  private async exportKeyPair(keyPair: CryptoKeyPair): Promise<EncryptionKeys> {
    const publicKeyBuffer = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const privateKeyBuffer = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(publicKeyBuffer),
      privateKey: this.arrayBufferToBase64(privateKeyBuffer),
    };
  }

  /**
   * Import a key pair from string format
   */
  private async importKeyPair(keys: EncryptionKeys): Promise<CryptoKeyPair> {
    const publicKeyBuffer = this.base64ToArrayBuffer(keys.publicKey);
    const privateKeyBuffer = this.base64ToArrayBuffer(keys.privateKey);

    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      {
        name: KEY_PAIR_ALGORITHM,
        hash: 'SHA-256',
      },
      true,
      ['encrypt']
    );

    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: KEY_PAIR_ALGORITHM,
        hash: 'SHA-256',
      },
      true,
      ['decrypt']
    );

    return { publicKey, privateKey };
  }

  /**
   * Store encryption keys in localStorage
   */
  private storeKeys(userId: string, keys: EncryptionKeys): void {
    localStorage.setItem(`${KEY_STORAGE_PREFIX}${userId}`, JSON.stringify(keys));
  }

  /**
   * Get encryption keys from localStorage
   */
  private getKeysFromStorage(userId: string): EncryptionKeys | null {
    const storedKeys = localStorage.getItem(`${KEY_STORAGE_PREFIX}${userId}`);
    if (!storedKeys) {
      return null;
    }

    try {
      return JSON.parse(storedKeys) as EncryptionKeys;
    } catch (error) {
      console.error('Error parsing stored keys:', error);
      return null;
    }
  }

  /**
   * Register public key with the server
   */
  private async registerPublicKey(publicKey: string): Promise<void> {
    try {
      await this.http.post(`${this.apiUrl}/register-key`, { publicKey }).toPromise();
    } catch (error) {
      console.error('Error registering public key:', error);
      throw error;
    }
  }

  /**
   * Setup encryption for a chat room
   */
  setupRoomEncryption(roomId: string): Observable<boolean> {
    if (!this.isEncryptionAvailable()) {
      return of(false);
    }

    return this.http
      .post<{ success: boolean; encryptedKey: string }>(`${this.apiUrl}/setup-room`, { roomId })
      .pipe(
        switchMap(async response => {
          if (!response.success) {
            return false;
          }

          try {
            // Generate a symmetric key for the room
            const symmetricKey = await this.generateSymmetricKey();

            // Store the key in memory
            this.roomKeys.set(roomId, symmetricKey);

            return true;
          } catch (error) {
            console.error('Error setting up room encryption:', error);
            return false;
          }
        }),
        catchError(error => {
          console.error('Error setting up room encryption:', error);
          return of(false);
        })
      );
  }

  /**
   * Generate a symmetric key for a chat room
   */
  private async generateSymmetricKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey(
      {
        name: SYMMETRIC_ALGORITHM,
        length: 256,
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Get the room key for a specific room
   */
  async getRoomKey(roomId: string): Promise<CryptoKey | null> {
    // Check if we already have the key in memory
    if (this.roomKeys.has(roomId)) {
      return this.roomKeys.get(roomId)!;
    }

    try {
      // Get the encrypted room key from the server
      const response = await this.http
        .get<{ encryptedKey: string }>(`${this.apiUrl}/room-key/${roomId}`)
        .toPromise();

      if (!response || !response.encryptedKey) {
        return null;
      }

      // Decrypt the room key with our private key
      const encryptedKeyBuffer = this.base64ToArrayBuffer(response.encryptedKey);

      if (!this.keyPair || !this.keyPair.privateKey) {
        console.error('Private key not available');
        return null;
      }

      const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
        {
          name: KEY_PAIR_ALGORITHM,
        },
        this.keyPair.privateKey,
        encryptedKeyBuffer
      );

      // Import the symmetric key
      const symmetricKey = await window.crypto.subtle.importKey(
        'raw',
        decryptedKeyBuffer,
        {
          name: SYMMETRIC_ALGORITHM,
          length: 256,
        },
        true,
        ['encrypt', 'decrypt']
      );

      // Store the key in memory
      this.roomKeys.set(roomId, symmetricKey);

      return symmetricKey;
    } catch (error) {
      console.error('Error getting room key:', error);
      return null;
    }
  }

  /**
   * Encrypt a message for a specific room
   */
  async encryptMessage(roomId: string, message: string): Promise<EncryptedData | null> {
    if (!this.isEncryptionAvailable()) {
      return null;
    }

    try {
      const roomKey = await this.getRoomKey(roomId);
      if (!roomKey) {
        console.error('Room key not available for encryption');
        return null;
      }

      // Generate a random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));

      // Encrypt the message
      const encodedMessage = new TextEncoder().encode(message);
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: SYMMETRIC_ALGORITHM,
          iv,
          tagLength: 128,
        },
        roomKey,
        encodedMessage
      );

      // Extract ciphertext and auth tag
      const encryptedBytes = new Uint8Array(encryptedBuffer);
      const ciphertextLength = encryptedBytes.length - 16; // 16 bytes for auth tag
      const ciphertext = encryptedBytes.slice(0, ciphertextLength);
      const authTag = encryptedBytes.slice(ciphertextLength);

      return {
        ciphertext: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        authTag: this.arrayBufferToBase64(authTag),
      };
    } catch (error) {
      console.error('Error encrypting message:', error);
      return null;
    }
  }

  /**
   * Decrypt a message from a specific room
   */
  async decryptMessage(roomId: string, encryptedData: EncryptedData): Promise<string | null> {
    if (!this.isEncryptionAvailable()) {
      return null;
    }

    try {
      const roomKey = await this.getRoomKey(roomId);
      if (!roomKey) {
        console.error('Room key not available for decryption');
        return null;
      }

      // Convert base64 to array buffers
      const ciphertext = this.base64ToArrayBuffer(encryptedData.ciphertext);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);
      const authTag = encryptedData.authTag
        ? this.base64ToArrayBuffer(encryptedData.authTag)
        : new Uint8Array(0);

      // Combine ciphertext and auth tag
      const encryptedBuffer = new Uint8Array(ciphertext.byteLength + authTag.byteLength);
      encryptedBuffer.set(new Uint8Array(ciphertext), 0);
      encryptedBuffer.set(new Uint8Array(authTag), ciphertext.byteLength);

      // Decrypt the message
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: SYMMETRIC_ALGORITHM,
          iv,
          tagLength: 128,
        },
        roomKey,
        encryptedBuffer
      );

      // Decode the decrypted message
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Error decrypting message:', error);
      return null;
    }
  }

  /**
   * Convert an ArrayBuffer to a Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert a Base64 string to an ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }
}
