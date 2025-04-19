// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (encryption.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { EncryptionService } from './encryption.service';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('EncryptionService', () => {
  let service: EncryptionService;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getCurrentUserId']);
    authSpy.getCurrentUserId.and.returnValue('test-user-id');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [EncryptionService, { provide: AuthService, useValue: authSpy }],
    });

    service = TestBed.inject(EncryptionService);
    httpMock = TestBed.inject(HttpTestingController);
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initialize', () => {
    it('should generate and store new keys if none exist', async () => {
      // Mock the crypto API
      const mockKeyPair = {
        publicKey: {} as CryptoKey,
        privateKey: {} as CryptoKey,
      };

      spyOn(window.crypto.subtle, 'generateKey').and.resolveTo(mockKeyPair);
      spyOn(window.crypto.subtle, 'exportKey').and.resolveTo(new ArrayBuffer(8));
      spyOn(service as any, 'arrayBufferToBase64').and.returnValue('test-key-data');
      spyOn(service as any, 'storeKeys');
      spyOn(service as any, 'registerPublicKey').and.resolveTo();

      const result = await service.initialize();

      expect(result).toBeTrue();
      expect(window.crypto.subtle.generateKey).toHaveBeenCalled();
      expect(service['storeKeys']).toHaveBeenCalledWith('test-user-id', jasmine.any(Object));
      expect(service['registerPublicKey']).toHaveBeenCalled();
    });

    it('should use existing keys if they exist', async () => {
      // Setup mock stored keys
      const mockKeys = {
        publicKey: 'test-public-key',
        privateKey: 'test-private-key',
      };

      spyOn(service as any, 'getKeysFromStorage').and.returnValue(mockKeys);
      spyOn(service as any, 'importKeyPair').and.resolveTo({} as CryptoKeyPair);
      spyOn(window.crypto.subtle, 'generateKey');

      const result = await service.initialize();

      expect(result).toBeTrue();
      expect(service['getKeysFromStorage']).toHaveBeenCalledWith('test-user-id');
      expect(service['importKeyPair']).toHaveBeenCalledWith(mockKeys);
      expect(window.crypto.subtle.generateKey).not.toHaveBeenCalled();
    });

    it('should return false if user ID is not available', async () => {
      authServiceSpy.getCurrentUserId.and.returnValue('');

      const result = await service.initialize();

      expect(result).toBeFalse();
    });
  });

  describe('temporary messages', () => {
    it('should include TTL when encrypting messages', async () => {
      const roomId = 'test-room-id';
      const message = 'This is a temporary message';
      const ttl = 3600000; // 1 hour in milliseconds

      // Mock the necessary methods
      spyOn(service, 'isEncryptionAvailable').and.returnValue(true);
      spyOn(service as any, 'getRoomKey').and.resolveTo({} as CryptoKey);
      spyOn(service as any, 'calculateMessageExpiry').and.returnValue(Date.now() + 86400000); // 1 day

      // Mock the crypto API
      const mockEncryptedBuffer = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]).buffer;
      spyOn(window.crypto.subtle, 'encrypt').and.resolveTo(mockEncryptedBuffer);
      spyOn(service as any, 'arrayBufferToBase64').and.returnValue('test-encrypted-data');

      // Call encryptMessage with a TTL
      const result = await service.encryptMessage(roomId, message, ttl);

      // Verify the result
      expect(result).toBeTruthy();
      expect(result.ciphertext).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();

      // The expiresAt should be set to now + ttl (approximately)
      const expectedExpiry = Date.now() + ttl;
      const actualExpiry = result.expiresAt;

      // Allow for a small time difference (up to 1 second)
      expect(Math.abs(actualExpiry - expectedExpiry)).toBeLessThan(1000);

      // Verify that calculateMessageExpiry was not called (since we provided a TTL)
      expect(service['calculateMessageExpiry']).not.toHaveBeenCalled();
    });

    it('should use default expiry when no TTL is provided', async () => {
      const roomId = 'test-room-id';
      const message = 'This is a message with default expiry';
      const defaultExpiry = Date.now() + 86400000; // 1 day

      // Mock the necessary methods
      spyOn(service, 'isEncryptionAvailable').and.returnValue(true);
      spyOn(service as any, 'getRoomKey').and.resolveTo({} as CryptoKey);
      spyOn(service as any, 'calculateMessageExpiry').and.returnValue(defaultExpiry);

      // Mock the crypto API
      const mockEncryptedBuffer = new Uint8Array([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ]).buffer;
      spyOn(window.crypto.subtle, 'encrypt').and.resolveTo(mockEncryptedBuffer);
      spyOn(service as any, 'arrayBufferToBase64').and.returnValue('test-encrypted-data');

      // Call encryptMessage without a TTL
      const result = await service.encryptMessage(roomId, message);

      // Verify the result
      expect(result).toBeTruthy();
      expect(result.ciphertext).toBeDefined();
      expect(result.iv).toBeDefined();
      expect(result.authTag).toBeDefined();

      // The expiresAt should be set to the value from calculateMessageExpiry
      expect(result.expiresAt).toBe(defaultExpiry);

      // Verify that calculateMessageExpiry was called
      expect(service['calculateMessageExpiry']).toHaveBeenCalledWith(roomId);
    });
  });

  describe('encryptMessage and decryptMessage', () => {
    it('should encrypt and decrypt a message correctly', async () => {
      const roomId = 'test-room-id';
      const originalMessage = 'Hello, this is a test message!';

      // Mock the room key
      const mockRoomKey = {} as CryptoKey;
      spyOn(service, 'getRoomKey').and.resolveTo(mockRoomKey);

      // Mock encryption
      const mockEncryptedBuffer = new ArrayBuffer(32);
      spyOn(window.crypto.subtle, 'encrypt').and.resolveTo(mockEncryptedBuffer);
      spyOn(service as any, 'arrayBufferToBase64').and.returnValue('encrypted-data');

      // Mock decryption
      spyOn(window.crypto.subtle, 'decrypt').and.resolveTo(
        new TextEncoder().encode(originalMessage).buffer
      );
      spyOn(service as any, 'base64ToArrayBuffer').and.returnValue(new ArrayBuffer(8));

      // Encrypt the message
      const encryptedData = await service.encryptMessage(roomId, originalMessage);

      expect(encryptedData).toBeTruthy();
      expect(service.getRoomKey).toHaveBeenCalledWith(roomId);
      expect(window.crypto.subtle.encrypt).toHaveBeenCalled();

      // Decrypt the message
      const decryptedMessage = await service.decryptMessage(roomId, encryptedData!);

      expect(decryptedMessage).toEqual(originalMessage);
      expect(window.crypto.subtle.decrypt).toHaveBeenCalled();
    });

    it('should return null when encryption fails', async () => {
      spyOn(service, 'getRoomKey').and.resolveTo(null);

      const result = await service.encryptMessage('room-id', 'test message');

      expect(result).toBeNull();
    });

    it('should return null when decryption fails', async () => {
      spyOn(service, 'getRoomKey').and.resolveTo({} as CryptoKey);
      spyOn(window.crypto.subtle, 'decrypt').and.rejectWith(new Error('Decryption failed'));

      const result = await service.decryptMessage('room-id', {
        ciphertext: 'test',
        iv: 'test',
        authTag: 'test',
      });

      expect(result).toBeNull();
    });
  });

  describe('setupRoomEncryption', () => {
    it('should set up room encryption successfully', done => {
      const roomId = 'test-room-id';

      spyOn(service, 'isEncryptionAvailable').and.returnValue(true);
      spyOn(service as any, 'generateSymmetricKey').and.resolveTo({} as CryptoKey);

      service.setupRoomEncryption(roomId).subscribe(result => {
        expect(result).toBeTrue();
        expect(service['roomKeys'].has(roomId)).toBeTrue();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/encryption/setup-room`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ roomId });
      req.flush({ success: true });
    });

    it('should return false if encryption is not available', done => {
      spyOn(service, 'isEncryptionAvailable').and.returnValue(false);

      service.setupRoomEncryption('room-id').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });
    });

    it('should handle server errors', done => {
      spyOn(service, 'isEncryptionAvailable').and.returnValue(true);

      service.setupRoomEncryption('room-id').subscribe(result => {
        expect(result).toBeFalse();
        done();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/chat/encryption/setup-room`);
      req.error(new ErrorEvent('Network error'));
    });
  });
});
