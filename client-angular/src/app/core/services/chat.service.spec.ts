// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (chat.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { EncryptionService } from './encryption.service';
import { environment } from '../../../environments/environment';

describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;
  let encryptionServiceSpy: jasmine.SpyObj<EncryptionService>;

  beforeEach(() => {
    // Create a spy for the EncryptionService
    encryptionServiceSpy = jasmine.createSpyObj('EncryptionService', [
      'isEncryptionAvailable',
      'encryptMessage',
      'decryptMessage',
    ]);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ChatService, { provide: EncryptionService, useValue: encryptionServiceSpy }],
    });

    service = TestBed.inject(ChatService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Temporary Messages', () => {
    it('should convert hours to milliseconds correctly', () => {
      expect(service.convertHoursToMilliseconds(1)).toBe(3_600_000);
      expect(service.convertHoursToMilliseconds(24)).toBe(86_400_000);
      expect(service.convertHoursToMilliseconds(0.5)).toBe(1_800_000);
    });

    it('should send unencrypted message with TTL', async () => {
      encryptionServiceSpy.isEncryptionAvailable.and.returnValue(false);

      const roomId = 'room123';
      const content = 'Test message';
      const replyToId = 'reply456';
      const ttl = service.convertHoursToMilliseconds(1);

      // Prepare a mock ChatMessage
      const mockResponse: ChatMessage = {
        id: 'msg789',
        content,
        replyToId,
        expiresAt: new Date(Date.now() + ttl),
        // ...other required ChatMessage fields
      };

      // Call method under test
      const resultPromise = service.sendMessage({ roomId, content, replyToId, ttl });

      // Expect an HTTP POST
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ roomId, content, replyToId, ttl });

      // Flush and await
      req.flush(mockResponse);
      const response = await resultPromise;

      // Validate response
      expect(response.id).toBe('msg789');
      expect(response.expiresAt).toBeDefined();
    });

    it('should send encrypted message with TTL', async () => {
      // Set up encryption service to return true for encryption availability
      encryptionServiceSpy.isEncryptionAvailable.and.returnValue(true);

      // Mock the encryption result
      const encryptedData = {
        ciphertext: 'encrypted-content',
        iv: 'initialization-vector',
        authTag: 'authentication-tag',
        expiresAt: Date.now() + 3600000, // 1 hour from now
      };
      encryptionServiceSpy.encryptMessage.and.resolveTo(encryptedData);

      const roomId = 'room123';
      const content = 'Test message';
      const replyToId = 'reply456';
      const ttl = 3600000; // 1 hour in milliseconds

      // Prepare a mock ChatMessage
      const mockMessage = {
        roomId,
        content,
        replyToId,
        ttl,
      };

      // Call the service method
      const resultPromise = service.sendMessage(mockMessage);

      // Verify the encryption service was called with the correct parameters
      expect(encryptionServiceSpy.encryptMessage).toHaveBeenCalledWith(roomId, content, ttl);

      // Verify the HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        message: encryptedData.ciphertext,
        replyTo: replyToId,
        isEncrypted: true,
        encryptionData: {
          iv: encryptedData.iv,
          authTag: encryptedData.authTag,
        },
        expiresAt: encryptedData.expiresAt,
      });

      // Respond with mock data
      const mockResponse = {
        _id: 'msg789',
        roomId,
        sender: 'user123',
        content: encryptedData.ciphertext,
        timestamp: new Date(),
        read: false,
        isEncrypted: true,
        encryptionData: {
          iv: encryptedData.iv,
          authTag: encryptedData.authTag,
        },
        expiresAt: encryptedData.expiresAt,
      };
      req.flush(mockResponse);

      // Await the promise and validate response
      const response = await resultPromise;
      expect(response._id).toBe('msg789');
      expect(response.expiresAt).toBeDefined();
    });

    it('should send message with attachments', async () => {
      const roomId = 'room123';
      const content = 'Test message with attachment';
      const files = [new File(['file content'], 'test.txt', { type: 'text/plain' })];

      // Call the service method - note that we're only passing the 3 parameters that the method accepts
      const resultPromise = service.sendMessageWithAttachments(roomId, content, files);

      // Verify the HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages/attachments`);
      expect(req.request.method).toBe('POST');

      // FormData is not easily testable, but we can verify it's a FormData object
      expect(req.request.body instanceof FormData).toBeTrue();

      // Respond with mock data
      const mockResponse = {
        _id: 'msg789',
        roomId,
        sender: 'user123',
        content,
        timestamp: new Date(),
        read: false,
        attachments: [
          {
            id: 'att123',
            name: 'test.txt',
            type: 'text/plain',
            size: 12,
            url: 'https://example.com/files/test.txt',
          },
        ],
        // Note: We're not including expiresAt here since we're not passing TTL to the method
      };
      req.flush(mockResponse);

      // Await the promise and validate response
      const response = await resultPromise;
      expect(response).toBeTruthy();
      expect(response._id).toBe('msg789');
    });
  });
});
