import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { EncryptionService, EncryptedData, EncryptedAttachmentData } from './encryption.service';

// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the encryption service
//
// COMMON CUSTOMIZATIONS:';
// - KEY_STORAGE_PREFIX: Prefix for keys stored in localStorage (default: 'chat_keys_')
// - ENABLE_ENCRYPTION: Enable end-to-end encryption (default: true)
// - KEY_PAIR_ALGORITHM: Algorithm used for key pair generation (default: 'RSA-OAEP')
// ===================================================

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [
        EncryptionService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should initialize the service', async () => {
      const result = await service.initialize();
      expect(result).toBeUndefined();
    });
  });

  describe('isEncryptionAvailable', () => {
    it('should check if encryption is available', () => {
      const result = service.isEncryptionAvailable();
      expect(result).toBeFalse();
    });
  });

  describe('message expiry settings', () => {
    it('should get message expiry settings for a room', () => {
      const roomId = 'test-room-id';
      const settings = service.getMessageExpirySettings(roomId);
      expect(settings).toEqual({ enabled: false });
    });

    it('should set message expiry settings for a room', () => {
      const roomId = 'test-room-id';
      const settings = { enabled: true, ttl: 3600000 };

      // This is a void method, just make sure it doesn't throw
      expect(() => service.setMessageExpirySettings(roomId, settings)).not.toThrow();
    });
  });

  describe('file encryption', () => {
    it('should encrypt a file', async () => {
      const roomId = 'test-room-id';
      const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

      const result = await service.encryptFile(roomId, file);

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(ArrayBuffer);
      expect(result.iv).toBeInstanceOf(Uint8Array);
      expect(result.authTag).toBeInstanceOf(Uint8Array);
    });

    it('should decrypt a file', async () => {
      const roomId = 'test-room-id';
      const mockResponse = {
        data: new ArrayBuffer(10),
        metadata: {
          originalName: 'test.txt',
          originalType: 'text/plain',
          size: 10,
        },
      };

      const result = await service.decryptFile(roomId, mockResponse);

      expect(result).toBeInstanceOf(File);
      expect(result.name).toBe('test.txt');
      expect(result.type).toBe('text/plain');
    });
  });

  describe('message encryption', () => {
    it('should encrypt a message', async () => {
      const roomId = 'test-room-id';
      const message = 'Hello, this is a test message!';

      const result = await service.encryptMessage(roomId, message);

      // In the stub implementation, it just returns the content as-is
      expect(result).toBe(message);
    });

    it('should decrypt a message', async () => {
      const roomId = 'test-room-id';
      const encryptedMessage = 'Encrypted message';

      const result = await service.decryptMessage(roomId, encryptedMessage);

      // In the stub implementation, it returns the encrypted message if it's a string
      expect(result).toBe(encryptedMessage);
    });

    it('should return null when decrypting non-string data', async () => {
      const roomId = 'test-room-id';
      const encryptedData = { someProperty: 'value' };

      const result = await service.decryptMessage(roomId, encryptedData);

      expect(result).toBeNull();
    });
  });

  describe('room key management', () => {
    it('should get a room key', async () => {
      const roomId = 'test-room-id';

      const result = await service.getRoomKey(roomId);

      // In the stub implementation, it returns an empty string
      expect(result).toBe('');
    });

    it('should set up room encryption', (done) => {
      const roomId = 'test-room-id';

      service.setupRoomEncryption(roomId).subscribe((result) => {
        // The stub implementation completes with null
        expect(result).toBeNull();
        done();
      });
    });

    it('should check and perform key rotations', () => {
      // This is a void method, just make sure it doesn't throw
      expect(() => service.checkAndPerformKeyRotations()).not.toThrow();
    });

    it('should rotate a room key', (done) => {
      const roomId = 'test-room-id';

      service.rotateRoomKey(roomId).subscribe((result) => {
        // The stub implementation completes with undefined
        expect(result).toBeUndefined();
        done();
      });
    });
  });
});
