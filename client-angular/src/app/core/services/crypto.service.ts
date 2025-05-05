import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private keyCache = new Map<string, CryptoKey>();
  private keyPairCache = new Map<string, CryptoKeyPair>();

  constructor() {}

  /**
   * Generate a random encryption key
   * @returns Promise<string> Base64 encoded key
   */
  async generateEncryptionKey(): Promise<string> {
    const key = await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt'],
    );

    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exportedKey);
  }

  /**
   * Generate a key pair for asymmetric encryption
   * @returns Promise<{publicKey: string, privateKey: string}>
   */
  async generateKeyPair(): Promise<{ publicKey: string; privateKey: string }> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt'],
    );

    const exportedPublicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
    const exportedPrivateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

    return {
      publicKey: this.arrayBufferToBase64(exportedPublicKey),
      privateKey: this.arrayBufferToBase64(exportedPrivateKey),
    };
  }

  /**
   * Encrypt a message with a public key
   * @param message Message to encrypt
   * @param publicKeyBase64 Base64 encoded public key
   * @returns Promise<string> Base64 encoded encrypted message
   */
  async encryptWithPublicKey(message: string, publicKeyBase64: string): Promise<string> {
    const publicKey = await this.importPublicKey(publicKeyBase64);

    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'RSA-OAEP',
      },
      publicKey,
      data,
    );

    return this.arrayBufferToBase64(encrypted);
  }

  /**
   * Decrypt a message with a private key
   * @param encryptedMessageBase64 Base64 encoded encrypted message
   * @param privateKeyBase64 Base64 encoded private key
   * @returns Promise<string> Decrypted message
   */
  async decryptWithPrivateKey(
    encryptedMessageBase64: string,
    privateKeyBase64: string,
  ): Promise<string> {
    const privateKey = await this.importPrivateKey(privateKeyBase64);

    const encryptedData = this.base64ToArrayBuffer(encryptedMessageBase64);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'RSA-OAEP',
      },
      privateKey,
      encryptedData,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Encrypt a message with a symmetric key
   * @param message Message to encrypt
   * @param keyBase64 Base64 encoded key
   * @returns Promise<{iv: string, encrypted: string, authTag: string}>
   */
  async encryptWithSymmetricKey(
    message: string,
    keyBase64: string,
  ): Promise<{ iv: string; encrypted: string }> {
    const key = await this.importSymmetricKey(keyBase64);

    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data,
    );

    return {
      iv: this.arrayBufferToBase64(iv),
      encrypted: this.arrayBufferToBase64(encrypted),
    };
  }

  /**
   * Decrypt a message with a symmetric key
   * @param encryptedData Object containing iv and encrypted message
   * @param keyBase64 Base64 encoded key
   * @returns Promise<string> Decrypted message
   */
  async decryptWithSymmetricKey(
    encryptedData: { iv: string; encrypted: string },
    keyBase64: string,
  ): Promise<string> {
    const key = await this.importSymmetricKey(keyBase64);

    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const encryptedMessage = this.base64ToArrayBuffer(encryptedData.encrypted);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedMessage,
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  /**
   * Import a public key
   * @param publicKeyBase64 Base64 encoded public key
   * @returns Promise<CryptoKey> Imported public key
   */
  private async importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
    if (this.keyCache.has(publicKeyBase64)) {
      return this.keyCache.get(publicKeyBase64)!;
    }

    const publicKeyData = this.base64ToArrayBuffer(publicKeyBase64);

    const publicKey = await window.crypto.subtle.importKey(
      'spki',
      publicKeyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['encrypt'],
    );

    this.keyCache.set(publicKeyBase64, publicKey);
    return publicKey;
  }

  /**
   * Import a private key
   * @param privateKeyBase64 Base64 encoded private key
   * @returns Promise<CryptoKey> Imported private key
   */
  private async importPrivateKey(privateKeyBase64: string): Promise<CryptoKey> {
    if (this.keyCache.has(privateKeyBase64)) {
      return this.keyCache.get(privateKeyBase64)!;
    }

    const privateKeyData = this.base64ToArrayBuffer(privateKeyBase64);

    const privateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyData,
      {
        name: 'RSA-OAEP',
        hash: 'SHA-256',
      },
      false,
      ['decrypt'],
    );

    this.keyCache.set(privateKeyBase64, privateKey);
    return privateKey;
  }

  /**
   * Import a symmetric key
   * @param keyBase64 Base64 encoded key
   * @returns Promise<CryptoKey> Imported symmetric key
   */
  private async importSymmetricKey(keyBase64: string): Promise<CryptoKey> {
    if (this.keyCache.has(keyBase64)) {
      return this.keyCache.get(keyBase64)!;
    }

    const keyData = this.base64ToArrayBuffer(keyBase64);

    const key = await window.crypto.subtle.importKey(
      'raw',
      keyData,
      {
        name: 'AES-GCM',
      },
      false,
      ['encrypt', 'decrypt'],
    );

    this.keyCache.set(keyBase64, key);
    return key;
  }

  /**
   * Convert an ArrayBuffer to a Base64 string
   * @param buffer ArrayBuffer to convert
   * @returns string Base64 encoded string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert a Base64 string to an ArrayBuffer
   * @param base64 Base64 encoded string
   * @returns ArrayBuffer Decoded ArrayBuffer
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
