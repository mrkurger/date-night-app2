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
      providers: [CachingService],
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

      // Install jasmine clock before any operations
      jasmine.clock().install();

      // Mock Date.now to control time
      const originalDateNow = Date.now;
      const startTime = 1000;
      let currentTime = startTime;

      spyOn(Date, 'now').and.callFake(() => currentTime);

      try {
        // First request to cache the data
        service.get(url, cacheTime).subscribe();
        httpMock.expectOne(url).flush(testData1);

        // Verify data is cached
        service.get(url, cacheTime).subscribe(data => {
          expect(data).toEqual(testData1);
        });
        httpMock.expectNone(url);

        // Advance time to expire the cache
        currentTime = startTime + cacheTime + 1;

        // Second request should fetch fresh data
        let receivedData: any;
        service.get(url, cacheTime).subscribe(data => {
          receivedData = data;
        });

        const req = httpMock.expectOne(url);
        expect(req.request.method).toBe('GET');
        req.flush(testData2);

        // Verify we got the new data
        expect(receivedData).toEqual(testData2);
      } finally {
        // Restore original Date.now
        (Date.now as any) = originalDateNow;
        jasmine.clock().uninstall();
      }
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
      let postResponse: any;
      service.post(url, testData, [invalidateUrl]).subscribe(response => {
        postResponse = response;
      });

      const postReq = httpMock.expectOne(url);
      expect(postReq.request.method).toBe('POST');
      expect(postReq.request.body).toEqual(testData);
      postReq.flush({ success: true });

      // Verify we got the response
      expect(postResponse).toEqual({ success: true });

      // Verify the cache was invalidated
      let getResponse: any;
      service.get(invalidateUrl).subscribe(response => {
        getResponse = response;
      });

      const getReq = httpMock.expectOne(invalidateUrl);
      expect(getReq.request.method).toBe('GET');
      getReq.flush([testData, { id: 2, name: 'Test 2' }]);

      // Verify we got the new data
      expect(getResponse).toEqual([testData, { id: 2, name: 'Test 2' }]);
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

      // Add explicit expectation for the cache to be empty
      expect(service['cache'].size).toBe(0);

      // Verify cache is cleared by checking that new requests go to the server
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

      // Add explicit expectation for the cache to be partially cleared
      // We expect only the URLs matching the pattern to be removed
      expect(service['cache'].has(url1)).toBeFalse();
      expect(service['cache'].has(url2)).toBeFalse();
      expect(service['cache'].has(url3)).toBeTrue();

      // Verify matching cache items are cleared
      let response1: any, response2: any, response3: any;

      service.get(url1).subscribe(data => (response1 = data));
      const req1 = httpMock.expectOne(url1);
      req1.flush({ id: 1, name: 'New Test 1' });
      expect(response1).toEqual({ id: 1, name: 'New Test 1' });

      service.get(url2).subscribe(data => (response2 = data));
      const req2 = httpMock.expectOne(url2);
      req2.flush({ id: 2, name: 'New Test 2' });
      expect(response2).toEqual({ id: 2, name: 'New Test 2' });

      // This one should still be cached
      service.get(url3).subscribe(data => (response3 = data));
      httpMock.expectNone(url3);
      expect(response3).toEqual(testData);
    });
  });
});
