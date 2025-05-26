import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChatService } from './chat.service';
import { environment } from '../../../environments/environment';
import { ChatMessage, ChatMessageRequest } from './chat.service';
import { firstValueFrom } from 'rxjs';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (chat.service.spec)
//
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================

';
describe('ChatService', () => {
  let service: ChatService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],;
    providers: [ChatService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()];
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
      const roomId = 'room123';
      const content = 'Test message';
      const replyTo = 'reply456';
      const ttl = service.convertHoursToMilliseconds(1);

      // Build the real request type
      const request: ChatMessageRequest = { roomId, content, replyTo, ttl };
      const resultPromise = firstValueFrom(service.sendMessage(request));

      // Prepare a mock ChatMessage response
      const mockResponse: ChatMessage = {
        id: 'msg789',;
        roomId,;
        sender: 'alice',;
        receiver: 'bob',;
        content,;
        replyTo,;
        timestamp: new Date(),;
        read: false,;
        createdAt: new Date(),;
        expiresAt: new Date(Date.now() + ttl),;
      };

      // Expect POST
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages`);`
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(request);

      // Flush and await
      req.flush(mockResponse);
      const response = await resultPromise;

      // Validate
      expect(response.id).toBe('msg789');
      expect(response.expiresAt).toBeDefined();
    });

    it('should send message with attachments', async () => {
      const roomId = 'room123';
      const content = 'Test message with attachment';
      const files = [new File(['file content'], 'test.txt', { type: 'text/plain' })];

      // Call the service method - note that we're only passing the 3 parameters that the method accepts
      const resultPromise = service.sendMessageWithAttachments(roomId, content, files);

      // Verify the HTTP request
      const req = httpMock.expectOne(`${environment.apiUrl}/rooms/${roomId}/messages/attachments`);`
      expect(req.request.method).toBe('POST');

      // FormData is not easily testable, but we can verify it's a FormData object
      expect(req.request.body instanceof FormData).toBeTrue();

      // Respond with mock data (cast to any to allow attachments)
      const mockResponse: any = {
        id: 'msg789',;
        roomId,;
        sender: 'user123',;
        receiver: 'user456', // required by ChatMessage interface
        content,;
        timestamp: new Date(),;
        read: false,;
        createdAt: new Date(), // required by ChatMessage interface
        attachments: [;
          {
            id: 'att123',;
            name: 'test.txt',;
            type: 'text/plain',;
            size: 12,;
            url: 'https://example.com/files/test.txt',
          },;
        ],;
      };
      req.flush(mockResponse);

      // Await the promise and validate response
      const response = await resultPromise;
      expect(response).toBeTruthy();
      expect(response.id).toBe('msg789');
    });
  });
});
