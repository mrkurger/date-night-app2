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
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs'; // Removed timer
import { catchError, switchMap } from 'rxjs/operators'; // Removed map, takeUntil
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

// Constants
const KEY_STORAGE_PREFIX = 'chat_keys_';
const ENABLE_ENCRYPTION = true;
const KEY_PAIR_ALGORITHM = 'RSA-OAEP';
const SYMMETRIC_ALGORITHM = 'AES-GCM';
const MESSAGE_AUTO_DELETION = true;
const DEFAULT_MESSAGE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface EncryptionKeys {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag?: string;
  expiresAt?: number; // Timestamp when the message should expire
}

export interface RoomKeys {
  roomId: string;
  symmetricKey: string;
  encryptedSymmetricKey: string;
  publicKeys: { [userId: string]: string };
}

export interface MessageExpirySettings {
  enabled: boolean;
  ttl: number; // Time-to-live in milliseconds
}

@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  private readonly apiUrl = environment.apiUrl + '/chat/encryption';
  private keyPair: CryptoKeyPair | null = null;
  private roomKeys: Map<string, CryptoKey> = new Map();
  private isInitialized = false;
  private messageExpirySettings: Map<string, MessageExpirySettings> = new Map(); // Room-specific expiry settings
  private defaultExpirySettings: MessageExpirySettings = {
    enabled: MESSAGE_AUTO_DELETION,
    ttl: DEFAULT_MESSAGE_TTL,
  };

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
      console.warn('Encryption is disabled');
      return false;
    }

    if (this.isInitialized) {
      return true;
    }

    try {
      // Check if we have keys in storage
      const userId = this.authService.getCurrentUser()?.id;
      if (!userId) {
        console.error('User ID not available');
        return false;
      }

      // Load user's key pair
      const storedKeys = this.getKeysFromStorage(userId);
      if (storedKeys) {
        // Import the stored keys
        this.keyPair = await this.importKeyPair(storedKeys);
      } else {
        // Generate new keys if none exist
        console.warn('Generating new encryption keys for user');
        this.keyPair = await this.generateKeyPair();

        // Export and store the keys
        const exportedKeys = await this.exportKeyPair(this.keyPair);
        this.storeKeys(userId, exportedKeys);

        // Register public key with the server
        await this.registerPublicKey(exportedKeys.publicKey);
      }

      // Load room keys from localStorage
      await this.loadStoredRoomKeys();

      // Load message expiry settings
      this.loadExpirySettings();

      // Start the message expiry checker if auto-deletion is enabled
      if (MESSAGE_AUTO_DELETION) {
        this.startMessageExpiryChecker();
      }

      this.isInitialized = true;
      console.warn('Encryption service initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing encryption service:', error);
      return false;
    }
  }

  /**
   * Load all message expiry settings from localStorage
   */
  private loadExpirySettings(): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    try {
      const key = `${KEY_STORAGE_PREFIX}${userId}_expiry_settings`;
      const storedSettings = localStorage.getItem(key);
      if (!storedSettings) return;

      const settingsMap = JSON.parse(storedSettings);

      // Load settings into memory
      Object.entries(settingsMap).forEach(([roomId, settings]) => {
        this.messageExpirySettings.set(roomId, settings as MessageExpirySettings);
      });

      console.warn(`Loaded expiry settings for ${this.messageExpirySettings.size} rooms`);
    } catch (error) {
      console.error('Error loading message expiry settings:', error);
    }
  }

  /**
   * Start the periodic checker for expired messages
   * This runs every minute to check for and delete expired messages
   */
  private startMessageExpiryChecker(): void {
    // Check for expired messages every minute
    const checkInterval = 60 * 1000; // 1 minute

    // Set up interval to check for expired messages
    setInterval(() => {
      this.checkAndDeleteExpiredMessages();
    }, checkInterval);

    console.warn('Message expiry checker started');
  }

  /**
   * Check for and delete expired messages
   */
  async checkAndDeleteExpiredMessages(): Promise<void> {
    if (!this.isEncryptionAvailable()) return;

    try {
      // Get all rooms with messages
      const rooms = await this.http.get<string[]>(`${this.apiUrl}/rooms-with-messages`).toPromise();

      if (!rooms || rooms.length === 0) return;

      const now = Date.now();

      // Check each room for expired messages
      for (const roomId of rooms) {
        // Get expiry settings for this room
        const settings = this.getMessageExpirySettings(roomId);

        // Skip if auto-deletion is disabled for this room
        if (!settings.enabled) continue;

        // Get expired messages for this room
        const expiredMessages = await this.http
          .get<string[]>(`${this.apiUrl}/expired-messages/${roomId}?timestamp=${now}`)
          .toPromise();

        if (!expiredMessages || expiredMessages.length === 0) continue;

        console.warn(`Found ${expiredMessages.length} expired messages in room ${roomId}`);

        // Delete expired messages
        await this.http
          .post(`${this.apiUrl}/delete-messages`, { messageIds: expiredMessages })
          .toPromise();

        console.warn(`Deleted ${expiredMessages.length} expired messages from room ${roomId}`);
      }
    } catch (error) {
      console.error('Error checking for expired messages:', error);
    }
  }

  /**
   * Load all stored room keys from localStorage into memory
   */
  private async loadStoredRoomKeys(): Promise<void> {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      return;
    }

    try {
      const roomKeysKey = `${KEY_STORAGE_PREFIX}${userId}_rooms`;
      const storedKeys = localStorage.getItem(roomKeysKey);
      if (!storedKeys) {
        return;
      }

      const roomKeysMap = JSON.parse(storedKeys);
      const roomIds = Object.keys(roomKeysMap);

      console.warn(`Loading ${roomIds.length} stored room keys`);

      for (const roomId of roomIds) {
        try {
          const keyBase64 = roomKeysMap[roomId];
          if (!keyBase64) continue;

          // Import the symmetric key
          const symmetricKey = await window.crypto.subtle.importKey(
            'raw',
            this.base64ToArrayBuffer(keyBase64),
            {
              name: SYMMETRIC_ALGORITHM,
              length: 256,
            },
            true,
            ['encrypt', 'decrypt']
          );

          // Store in memory
          this.roomKeys.set(roomId, symmetricKey);
        } catch (importError) {
          console.error(`Error importing stored key for room ${roomId}:`, importError);
          // Continue with other keys
        }
      }

      console.warn(`Successfully loaded ${this.roomKeys.size} room keys`);
    } catch (error) {
      console.error('Error loading stored room keys:', error);
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
   * This method handles both creating new room encryption and joining existing encrypted rooms
   */
  setupRoomEncryption(roomId: string): Observable<boolean> {
    if (!this.isEncryptionAvailable()) {
      console.warn('Encryption is not available, skipping room encryption setup');
      return of(false);
    }

    if (!this.keyPair) {
      console.error('Key pair not available for room encryption setup');
      return of(false);
    }

    // First check if we already have a key for this room
    if (this.roomKeys.has(roomId)) {
      console.warn(`Room key already exists for room ${roomId}`);
      return of(true);
    }

    // Export our public key for the server
    return from(this.exportKeyPair(this.keyPair)).pipe(
      switchMap(keys =>
        this.http.post<{
          success: boolean;
          encryptedKey?: string;
          isNewSetup?: boolean;
          roomKeyId?: string;
        }>(`${this.apiUrl}/setup-room`, {
          roomId,
          publicKey: keys.publicKey,
        })
      ),
      switchMap(async response => {
        if (!response.success) {
          console.error('Server reported failure in room encryption setup');
          return false;
        }

        try {
          if (response.isNewSetup) {
            // We're the first to set up encryption for this room
            // Generate a symmetric key for the room
            const symmetricKey = await this.generateSymmetricKey();

            // Export the key to raw format for sending to server
            const exportedKey = await window.crypto.subtle.exportKey('raw', symmetricKey);
            const keyBase64 = this.arrayBufferToBase64(exportedKey);

            // Send the symmetric key to the server (encrypted for each participant)
            await this.http
              .post(`${this.apiUrl}/room-key/${roomId}`, {
                symmetricKey: keyBase64,
                keyId: response.roomKeyId,
              })
              .toPromise();

            // Store the key in memory
            this.roomKeys.set(roomId, symmetricKey);

            // Also store in localStorage for persistence
            this.storeRoomKey(roomId, keyBase64);

            console.warn(`Created new encryption for room ${roomId}`);
            return true;
          } else if (response.encryptedKey) {
            // We're joining an existing encrypted room
            // Decrypt the room key with our private key
            const encryptedKeyBuffer = this.base64ToArrayBuffer(response.encryptedKey);

            if (!this.keyPair.privateKey) {
              console.error('Private key not available for decryption');
              return false;
            }

            try {
              const decryptedKeyBuffer = await window.crypto.subtle.decrypt(
                { name: KEY_PAIR_ALGORITHM },
                this.keyPair.privateKey,
                encryptedKeyBuffer
              );

              // Import the symmetric key
              const symmetricKey = await window.crypto.subtle.importKey(
                'raw',
                decryptedKeyBuffer,
                { name: SYMMETRIC_ALGORITHM, length: 256 },
                true,
                ['encrypt', 'decrypt']
              );

              // Store the key in memory
              this.roomKeys.set(roomId, symmetricKey);

              // Also store in localStorage for persistence
              this.storeRoomKey(roomId, this.arrayBufferToBase64(decryptedKeyBuffer));

              console.warn(`Joined existing encrypted room ${roomId}`);
              return true;
            } catch (decryptError) {
              console.error('Error decrypting room key:', decryptError);
              return false;
            }
          } else {
            console.error('No encrypted key provided for existing room');
            return false;
          }
        } catch (error) {
          console.error('Error setting up room encryption:', error);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error in room encryption setup process:', error);
        return of(false);
      })
    );
  }

  /**
   * Store a room key in localStorage for persistence
   */
  private storeRoomKey(roomId: string, keyBase64: string): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      console.error('User ID not available for storing room key');
      return;
    }

    try {
      // Get existing room keys or initialize empty object
      const roomKeysKey = `${KEY_STORAGE_PREFIX}${userId}_rooms`;
      const existingKeys = localStorage.getItem(roomKeysKey);
      const roomKeysMap = existingKeys ? JSON.parse(existingKeys) : {};

      // Add or update this room's key
      roomKeysMap[roomId] = keyBase64;

      // Store back to localStorage
      localStorage.setItem(roomKeysKey, JSON.stringify(roomKeysMap));
    } catch (error) {
      console.error('Error storing room key:', error);
    }
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
   * This method tries multiple sources to get the key:
   * 1. In-memory cache
   * 2. Local storage
   * 3. Server (which will encrypt it with our public key)
   */
  async getRoomKey(roomId: string): Promise<CryptoKey | null> {
    // Check if we already have the key in memory
    if (this.roomKeys.has(roomId)) {
      return this.roomKeys.get(roomId)!;
    }

    try {
      // Try to get the key from localStorage
      const storedKey = this.getStoredRoomKey(roomId);
      if (storedKey) {
        try {
          // Import the symmetric key from the stored raw format
          const symmetricKey = await window.crypto.subtle.importKey(
            'raw',
            this.base64ToArrayBuffer(storedKey),
            {
              name: SYMMETRIC_ALGORITHM,
              length: 256,
            },
            true,
            ['encrypt', 'decrypt']
          );

          // Store in memory for future use
          this.roomKeys.set(roomId, symmetricKey);
          console.warn(`Loaded room key for ${roomId} from local storage`);
          return symmetricKey;
        } catch (importError) {
          console.error('Error importing stored room key:', importError);
          // Continue to try getting from server
        }
      }

      // If not in localStorage, get from server
      console.warn(`Requesting room key for ${roomId} from server`);
      const response = await this.http
        .get<{ encryptedKey: string; success: boolean }>(`${this.apiUrl}/room-key/${roomId}`)
        .toPromise();

      if (!response || !response.success || !response.encryptedKey) {
        console.error('Failed to get room key from server');
        return null;
      }

      // Decrypt the room key with our private key
      const encryptedKeyBuffer = this.base64ToArrayBuffer(response.encryptedKey);

      if (!this.keyPair || !this.keyPair.privateKey) {
        console.error('Private key not available for room key decryption');
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

      // Also store in localStorage for persistence
      this.storeRoomKey(roomId, this.arrayBufferToBase64(decryptedKeyBuffer));

      console.warn(`Retrieved and stored room key for ${roomId} from server`);
      return symmetricKey;
    } catch (error) {
      console.error('Error getting room key:', error);
      return null;
    }
  }

  /**
   * Get a stored room key from localStorage
   */
  private getStoredRoomKey(roomId: string): string | null {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      return null;
    }

    try {
      const roomKeysKey = `${KEY_STORAGE_PREFIX}${userId}_rooms`;
      const storedKeys = localStorage.getItem(roomKeysKey);
      if (!storedKeys) {
        return null;
      }

      const roomKeysMap = JSON.parse(storedKeys);
      return roomKeysMap[roomId] || null;
    } catch (error) {
      console.error('Error retrieving stored room key:', error);
      return null;
    }
  }

  /**
   * Encrypt a message for a specific room
   */
  /**
   * Set message expiry settings for a specific room
   * @param roomId The room ID
   * @param settings The expiry settings to apply
   */
  setMessageExpirySettings(roomId: string, settings: MessageExpirySettings): void {
    this.messageExpirySettings.set(roomId, settings);

    // Store settings in localStorage for persistence
    this.storeExpirySettings(roomId, settings);
  }

  /**
   * Get message expiry settings for a specific room
   * @param roomId The room ID
   * @returns The expiry settings for the room, or the default settings if none are set
   */
  getMessageExpirySettings(roomId: string): MessageExpirySettings {
    // Check if we have room-specific settings
    if (this.messageExpirySettings.has(roomId)) {
      return this.messageExpirySettings.get(roomId)!;
    }

    // Try to load from localStorage
    const storedSettings = this.getStoredExpirySettings(roomId);
    if (storedSettings) {
      this.messageExpirySettings.set(roomId, storedSettings);
      return storedSettings;
    }

    // Fall back to default settings
    return this.defaultExpirySettings;
  }

  /**
   * Store message expiry settings in localStorage
   * @param roomId The room ID
   * @param settings The settings to store
   */
  private storeExpirySettings(roomId: string, settings: MessageExpirySettings): void {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return;

    try {
      const key = `${KEY_STORAGE_PREFIX}${userId}_expiry_settings`;
      const existingSettings = localStorage.getItem(key);
      const settingsMap = existingSettings ? JSON.parse(existingSettings) : {};

      settingsMap[roomId] = settings;
      localStorage.setItem(key, JSON.stringify(settingsMap));
    } catch (error) {
      console.error('Error storing message expiry settings:', error);
    }
  }

  /**
   * Get stored message expiry settings from localStorage
   * @param roomId The room ID
   * @returns The stored settings, or null if none exist
   */
  private getStoredExpirySettings(roomId: string): MessageExpirySettings | null {
    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) return null;

    try {
      const key = `${KEY_STORAGE_PREFIX}${userId}_expiry_settings`;
      const storedSettings = localStorage.getItem(key);
      if (!storedSettings) return null;

      const settingsMap = JSON.parse(storedSettings);
      return settingsMap[roomId] || null;
    } catch (error) {
      console.error('Error retrieving stored message expiry settings:', error);
      return null;
    }
  }

  /**
   * Calculate the expiry timestamp for a message
   * @param roomId The room ID
   * @returns The timestamp when the message should expire, or undefined if auto-deletion is disabled
   */
  private calculateMessageExpiry(roomId: string): number | undefined {
    const settings = this.getMessageExpirySettings(roomId);

    if (!settings.enabled) {
      return undefined;
    }

    return Date.now() + settings.ttl;
  }

  async encryptMessage(
    roomId: string,
    message: string,
    ttl?: number
  ): Promise<EncryptedData | null> {
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

      // Calculate message expiry timestamp
      // If a specific TTL is provided, use it; otherwise, use the default expiry calculation
      const expiresAt = ttl ? Date.now() + ttl : this.calculateMessageExpiry(roomId);

      return {
        ciphertext: this.arrayBufferToBase64(ciphertext),
        iv: this.arrayBufferToBase64(iv),
        authTag: this.arrayBufferToBase64(authTag),
        expiresAt,
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
   * Rotate the encryption key for a room
   * This enhances security by periodically changing the encryption key
   * @param roomId The ID of the room to rotate keys for
   * @returns Observable<boolean> Success status
   */
  rotateRoomKey(roomId: string): Observable<boolean> {
    if (!this.isEncryptionAvailable() || !this.keyPair) {
      console.warn('Encryption not available for key rotation');
      return of(false);
    }

    return from(this.exportKeyPair(this.keyPair)).pipe(
      switchMap(keys =>
        this.http.post<{
          success: boolean;
          roomKeyId?: string;
        }>(`${this.apiUrl}/rotate-key/${roomId}`, {
          publicKey: keys.publicKey,
        })
      ),
      switchMap(async response => {
        if (!response.success) {
          console.error('Server reported failure in key rotation');
          return false;
        }

        try {
          // Generate a new symmetric key for the room
          const newSymmetricKey = await this.generateSymmetricKey();

          // Export the key to raw format for sending to server
          const exportedKey = await window.crypto.subtle.exportKey('raw', newSymmetricKey);
          const keyBase64 = this.arrayBufferToBase64(exportedKey);

          // Send the new symmetric key to the server
          await this.http
            .post(`${this.apiUrl}/room-key/${roomId}`, {
              symmetricKey: keyBase64,
              keyId: response.roomKeyId,
              isRotation: true,
            })
            .toPromise();

          // Update the key in memory
          this.roomKeys.set(roomId, newSymmetricKey);

          // Update in localStorage
          this.storeRoomKey(roomId, keyBase64);

          console.warn(`Successfully rotated encryption key for room ${roomId}`);
          return true;
        } catch (error) {
          console.error('Error rotating room key:', error);
          return false;
        }
      }),
      catchError(error => {
        console.error('Error in key rotation process:', error);
        return of(false);
      })
    );
  }

  /**
   * Schedule automatic key rotation for a room
   * @param roomId The ID of the room to schedule key rotation for
   * @param intervalDays Number of days between rotations (default: 30)
   */
  scheduleKeyRotation(roomId: string, intervalDays = 30): void {
    if (!this.isEncryptionAvailable()) {
      return;
    }

    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      return;
    }

    try {
      // Store the last rotation time and interval
      const rotationKey = `${KEY_STORAGE_PREFIX}${userId}_rotation`;
      const rotationData = localStorage.getItem(rotationKey);
      const rotations = rotationData ? JSON.parse(rotationData) : {};

      // Set the last rotation time to now
      rotations[roomId] = {
        lastRotation: Date.now(),
        intervalDays: intervalDays,
      };

      localStorage.setItem(rotationKey, JSON.stringify(rotations));

      console.warn(`Scheduled key rotation for room ${roomId} every ${intervalDays} days`);
    } catch (error) {
      console.error('Error scheduling key rotation:', error);
    }
  }

  /**
   * Check if any room keys need rotation and perform rotation if needed
   * This should be called periodically, e.g., when the app starts
   */
  checkAndPerformKeyRotations(): void {
    if (!this.isEncryptionAvailable()) {
      return;
    }

    const userId = this.authService.getCurrentUser()?.id;
    if (!userId) {
      return;
    }

    try {
      const rotationKey = `${KEY_STORAGE_PREFIX}${userId}_rotation`;
      const rotationData = localStorage.getItem(rotationKey);
      if (!rotationData) {
        return;
      }

      const rotations = JSON.parse(rotationData);
      const now = Date.now();

      Object.entries(rotations).forEach(([roomId, data]: [string, any]) => {
        const { lastRotation, intervalDays } = data;
        const rotationInterval = intervalDays * 24 * 60 * 60 * 1000; // Convert days to ms

        if (now - lastRotation >= rotationInterval) {
          console.warn(`Key rotation needed for room ${roomId}`);

          // Perform key rotation
          this.rotateRoomKey(roomId).subscribe(success => {
            if (success) {
              // Update last rotation time
              rotations[roomId].lastRotation = now;
              localStorage.setItem(rotationKey, JSON.stringify(rotations));
            }
          });
        }
      });
    } catch (error) {
      console.error('Error checking for key rotations:', error);
    }
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
