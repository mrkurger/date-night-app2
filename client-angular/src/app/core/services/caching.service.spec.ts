
// ===================================================
// CUSTOMIZABLE SETTINGS IN THIS FILE
// ===================================================
// This file contains settings for service configuration (caching.service.spec)
// 
// COMMON CUSTOMIZATIONS:
// - SETTING_NAME: Description of setting (default: value)
//   Related to: other_file.ts:OTHER_SETTING
// ===================================================
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CachingService } from './caching.service';

describe('CachingService', () => {
  let service: CachingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CachingService]
    });
    service = TestBed.inject(CachingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should fetch data from server when not in cache', () => {
      const testData = { id: 1, name: 'Test' };
      const url = '/api/test';

      service.get(url).subscribe(data => {
        expect(data).toEqual(testData);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(testData);
    });

    it('should return cached data when available and not expired', () => {
      const testData = { id: 1, name: 'Test' };
      const url = '/api/test';

      // First request to cache the data
      service.get(url).subscribe();
      httpMock.expectOne(url).flush(testData);

      // Second request should use cached data
      service.get(url).subscribe(data => {
        expect(data).toEqual(testData);
      });

      // No HTTP request should be made for the second call
      httpMock.expectNone(url);
    });

    it('should fetch fresh data when cache is expired', () => {
      const testData1 = { id: 1, name: 'Test 1' };
      const testData2 = { id: 1, name: 'Test 2' };
      const url = '/api/test';
      const cacheTime = 100; // 100ms cache time

      // First request to cache the data
      service.get(url, cacheTime).subscribe();
      httpMock.expectOne(url).flush(testData1);

      // Wait for cache to expire
      jasmine.clock().install();
      jasmine.clock().tick(cacheTime + 1);

      // Second request should fetch fresh data
      service.get(url, cacheTime).subscribe(data => {
        expect(data).toEqual(testData2);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(testData2);

      jasmine.clock().uninstall();
    });
  });

  describe('post', () => {
    it('should send POST request and invalidate specified URLs', () => {
      const testData = { id: 1, name: 'Test' };
      const url = '/api/test';
      const invalidateUrl = '/api/test-list';

      // First, cache some data
      service.get(invalidateUrl).subscribe();
      httpMock.expectOne(invalidateUrl).flush([testData]);

      // Verify the data is cached
      service.get(invalidateUrl).subscribe();
      httpMock.expectNone(invalidateUrl);

      // Post data and invalidate cache
      service.post(url, testData, [invalidateUrl]).subscribe();
      httpMock.expectOne(url).flush({ success: true });

      // Verify the cache was invalidated
      service.get(invalidateUrl).subscribe();
      httpMock.expectOne(invalidateUrl);
    });
  });

  describe('clearCache', () => {
    it('should clear the entire cache', () => {
      const testData = { id: 1, name: 'Test' };
      const url1 = '/api/test1';
      const url2 = '/api/test2';

      // Cache some data
      service.get(url1).subscribe();
      httpMock.expectOne(url1).flush(testData);

      service.get(url2).subscribe();
      httpMock.expectOne(url2).flush(testData);

      // Verify data is cached
      service.get(url1).subscribe();
      service.get(url2).subscribe();
      httpMock.expectNone(url1);
      httpMock.expectNone(url2);

      // Clear cache
      service.clearCache();

      // Verify cache is cleared
      service.get(url1).subscribe();
      service.get(url2).subscribe();
      httpMock.expectOne(url1);
      httpMock.expectOne(url2);
    });
  });

  describe('clearCachePattern', () => {
    it('should clear cache items matching a pattern', () => {
      const testData = { id: 1, name: 'Test' };
      const url1 = '/api/users/1';
      const url2 = '/api/users/2';
      const url3 = '/api/products/1';

      // Cache some data
      service.get(url1).subscribe();
      httpMock.expectOne(url1).flush(testData);

      service.get(url2).subscribe();
      httpMock.expectOne(url2).flush(testData);

      service.get(url3).subscribe();
      httpMock.expectOne(url3).flush(testData);

      // Verify data is cached
      service.get(url1).subscribe();
      service.get(url2).subscribe();
      service.get(url3).subscribe();
      httpMock.expectNone(url1);
      httpMock.expectNone(url2);
      httpMock.expectNone(url3);

      // Clear cache with pattern
      service.clearCachePattern('/api/users');

      // Verify matching cache items are cleared
      service.get(url1).subscribe();
      service.get(url2).subscribe();
      service.get(url3).subscribe();
      httpMock.expectOne(url1);
      httpMock.expectOne(url2);
      httpMock.expectNone(url3);
    });
  });
});