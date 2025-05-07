// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains tests for the media service
//
// COMMON CUSTOMIZATIONS:
// - MOCK_MEDIA: Mock media data for testing
//   Related to: client-angular/src/app/core/models/media.interface.ts
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

import { MediaService } from './media.service';
import { CachingService } from './caching.service';
import { PendingMedia } from '../models/media.interface';
import { environment } from '../../../environments/environment';

describe('MediaService', () => {
  let service: MediaService;
  let httpMock: HttpTestingController;
  let cachingServiceSpy: jasmine.SpyObj<CachingService>;

  const apiUrl = `${environment.apiUrl}/media`;

  // Mock data for testing
  const mockAdId = 'ad123';
  const mockMediaId = 'media123';

  const mockPendingMedia: PendingMedia[] = [
    {
      _id: 'media1',
      adId: 'ad1',
      adTitle: 'Test Ad 1',
      type: 'image',
      url: 'https://example.com/image1.jpg',
      createdAt: new Date('2023-01-01'),
    },
    {
      _id: 'media2',
      adId: 'ad2',
      adTitle: 'Test Ad 2',
      type: 'video',
      url: 'https://example.com/video1.mp4',
      createdAt: new Date('2023-01-02'),
    },
  ];

  const mockAdMedia = [
    {
      _id: 'media1',
      type: 'image',
      url: 'https://example.com/image1.jpg',
      isFeatured: true,
      status: 'approved',
      createdAt: new Date('2023-01-01'),
    },
    {
      _id: 'media2',
      type: 'video',
      url: 'https://example.com/video1.mp4',
      isFeatured: false,
      status: 'approved',
      createdAt: new Date('2023-01-02'),
    },
  ];

  beforeEach(() => {
    // Create a spy for the CachingService
    cachingServiceSpy = jasmine.createSpyObj('CachingService', ['get']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MediaService, { provide: CachingService, useValue: cachingServiceSpy }],
    });

    service = TestBed.inject(MediaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Service Initialization', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });
  });

  describe('Media Upload', () => {
    it('should upload media for an ad', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = { message: 'Upload successful' };

      // Create a proper HttpResponse object
      const mockEvent = new HttpResponse({
        body: mockResponse,
        status: 200,
      });

      let receivedResponse: any = null;

      service.uploadMedia(mockAdId, mockFile).subscribe((event) => {
        if (event instanceof HttpResponse) {
          receivedResponse = event.body;
        }
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/upload`);
      expect(req.request.method).toBe('POST');

      // Verify FormData contains the file
      expect(req.request.body instanceof FormData).toBeTrue();

      // Flush with the HttpResponse object
      req.flush(mockResponse, {
        status: 200,
        statusText: 'OK',
      });

      // Verify we received the response
      expect(receivedResponse).toEqual(mockResponse);
    });
  });

  describe('Media Management', () => {
    it('should delete media from an ad', () => {
      // The API returns void/null, so we should expect undefined or null
      service.deleteMedia(mockAdId, mockMediaId).subscribe((response) => {
        // Accept either undefined or null as valid responses
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/media/${mockMediaId}`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });

    it('should set featured media for an ad', () => {
      // The API returns void/null, so we should expect undefined or null
      service.setFeaturedMedia(mockAdId, mockMediaId).subscribe((response) => {
        // Accept either undefined or null as valid responses
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/media/${mockMediaId}/featured`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });

    it('should get all media for an ad using caching service', () => {
      cachingServiceSpy.get.and.returnValue(of(mockAdMedia));

      service.getAdMedia(mockAdId).subscribe((media) => {
        expect(media).toEqual(mockAdMedia);
      });

      expect(cachingServiceSpy.get).toHaveBeenCalledWith(`${apiUrl}/${mockAdId}/media`);
    });
  });

  describe('Moderation', () => {
    it('should get all media pending moderation', () => {
      service.getPendingModerationMedia().subscribe((media) => {
        expect(media).toEqual(mockPendingMedia);
      });

      const req = httpMock.expectOne(`${apiUrl}/pending`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPendingMedia);
    });

    it('should moderate media with approval', () => {
      const status = 'approved';
      const notes = 'Content meets guidelines';

      // The API returns void/null, so we should expect undefined or null
      service.moderateMedia(mockAdId, mockMediaId, status, notes).subscribe((response) => {
        // Accept either undefined or null as valid responses
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/moderate/${mockMediaId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ status, notes });
      req.flush(null);
    });

    it('should moderate media with rejection', () => {
      const status = 'rejected';
      const notes = 'Content violates guidelines';

      // The API returns void/null, so we should expect undefined or null
      service.moderateMedia(mockAdId, mockMediaId, status, notes).subscribe((response) => {
        // Accept either undefined or null as valid responses
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/moderate/${mockMediaId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ status, notes });
      req.flush(null);
    });

    it('should moderate media with default empty notes', () => {
      const status = 'approved';

      // The API returns void/null, so we should expect undefined or null
      service.moderateMedia(mockAdId, mockMediaId, status).subscribe((response) => {
        // Accept either undefined or null as valid responses
        expect(response === undefined || response === null).toBeTrue();
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/moderate/${mockMediaId}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ status, notes: '' });
      req.flush(null);
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle HTTP errors when uploading media', () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const errorResponse = { status: 500, statusText: 'Server Error' };

      // Create a spy to track the error callback
      const errorSpy = jasmine.createSpy('error');

      // Subscribe to the service method with proper error handling
      service.uploadMedia(mockAdId, mockFile).subscribe({
        next: () => {},
        error: (error) => {
          errorSpy(error);
        },
      });

      // Get the request and simulate an error response
      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/upload`);
      expect(req.request.method).toBe('POST');

      // Use error instead of flush to simulate an HTTP error response
      req.error(new ErrorEvent('Network error'), errorResponse);

      // Verify the error callback was called with the correct error
      expect(errorSpy).toHaveBeenCalled();
      const errorArg = errorSpy.calls.mostRecent().args[0];
      expect(errorArg.status).toBe(500);
    });
  });

  describe('Error Handling for Admin Operations', () => {
    it('should handle HTTP errors when getting pending media', () => {
      const errorResponse = { status: 403, statusText: 'Forbidden' };
      const errorSpy = jasmine.createSpy('error');

      service.getPendingModerationMedia().subscribe({
        next: () => fail('should have failed with a 403 error'),
        error: (error) => {
          errorSpy(error);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/pending`);
      req.error(new ErrorEvent('Forbidden'), errorResponse);

      expect(errorSpy).toHaveBeenCalled();
      const errorArg = errorSpy.calls.mostRecent().args[0];
      expect(errorArg.status).toBe(403);
    });

    it('should handle HTTP errors when moderating media', () => {
      const errorResponse = { status: 400, statusText: 'Bad Request' };
      const errorSpy = jasmine.createSpy('error');

      service.moderateMedia(mockAdId, mockMediaId, 'approved', 'notes').subscribe({
        next: () => fail('should have failed with a 400 error'),
        error: (error) => {
          errorSpy(error);
        },
      });

      const req = httpMock.expectOne(`${apiUrl}/${mockAdId}/moderate/${mockMediaId}`);
      req.error(new ErrorEvent('Bad Request'), errorResponse);

      expect(errorSpy).toHaveBeenCalled();
      const errorArg = errorSpy.calls.mostRecent().args[0];
      expect(errorArg.status).toBe(400);
    });
  });

  next(event: HttpEvent<unknown>): void {
    // Emit the mock event
    this.events$.next(event);
  }
});
