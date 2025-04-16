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
      // Test with various hour values
      expect(service.convertHoursToMilliseconds(1)).toBe(3600000); // 1 hour = 3,600,000 ms
      expect(service.convertHoursToMilliseconds(24)).toBe(86400000); // 24 hours = 86,400,000 ms
      expect(service.convertHoursToMilliseconds(0.5)).toBe(1800000); // 0.5 hours = 1,800,000 ms
    });

    it('should send unencrypted message with TTL', () => {
      // Set up encryption service to return false for encryption availability
      encryptionServiceSpy.isEncryptionAvailable.and.returnValue(false);

      const roomId = 'room123';
      const content = 'Test message';
      const replyToId = 'reply456';
      const ttl = 3600000; // 1 hour in milliseconds

      // Call the service method
      service.sendMessage(roomId, content, replyToId, ttl).subscribe(response => {
        expect(response).toBeTruthy();
        expect(response._id).toBe('msg789');
        expect(response.expiresAt).toBeDefined();
      });

      // Verify the HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        message: content,
        replyTo: replyToId,
        isEncrypted: false,
        expiresAt: jasmine.any(Number),
      });

      // Respond with mock data
      req.flush({
        _id: 'msg789',
        roomId,
        sender: 'user123',
        content,
        timestamp: new Date(),
        read: false,
        expiresAt: Date.now() + ttl,
      });
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

      // Call the service method
      service.sendMessage(roomId, content, replyToId, ttl).subscribe(response => {
        expect(response).toBeTruthy();
        expect(response._id).toBe('msg789');
        expect(response.expiresAt).toBeDefined();
      });

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
      req.flush({
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
      });
    });

    it('should send message with attachments and TTL', () => {
      const roomId = 'room123';
      const content = 'Test message with attachment';
      const files = [new File(['file content'], 'test.txt', { type: 'text/plain' })];
      const replyToId = 'reply456';
      const ttl = 3600000; // 1 hour in milliseconds

      // Call the service method
      service
        .sendMessageWithAttachments(roomId, content, files, replyToId, ttl)
        .subscribe(response => {
          expect(response).toBeTruthy();
          expect(response._id).toBe('msg789');
          expect(response.expiresAt).toBeDefined();
        });

      // Verify the HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages/attachments`);
      expect(req.request.method).toBe('POST');

      // FormData is not easily testable, but we can verify it's a FormData object
      expect(req.request.body instanceof FormData).toBeTrue();

      // Respond with mock data
      req.flush({
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
        expiresAt: Date.now() + ttl,
      });
    });
  });
});
