import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { CSPInterceptor } from './csp.interceptor';
import { Injectable } from '@angular/core';

/**
 * Mock Location Service to avoid issues with window.location
 */
@Injectable()
class MockLocationService {
  private _origin = 'http://localhost:4200';

  get origin(): string {
    return this._origin;
  }

  set origin(value: string) {
    this._origin = value;
  }

  isSameOrigin(url: string): boolean {
    if (url.startsWith('/')) {
      return true;
    }

    try {
      const urlObj = new URL(url);
      return urlObj.origin === this.origin;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Unit tests for the CSPInterceptor
 *
 * These tests verify that the interceptor:
 * 1. Adds CSP headers to same-origin requests
 * 2. Doesn't add CSP headers to cross-origin requests
 * 3. Includes all required CSP directives in the header
 */
describe('CSPInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let interceptor: CSPInterceptor;
  let locationService: MockLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CSPInterceptor,
        { provide: HTTP_INTERCEPTORS, useClass: CSPInterceptor, multi: true },
        MockLocationService,
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(CSPInterceptor);
    locationService = TestBed.inject(MockLocationService);

    // Patch the interceptor to use our mock location service
    interceptor['isSameOrigin'] = (url: string) => locationService.isSameOrigin(url);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add CSP headers to same-origin requests', () => {
    // Set the origin in our mock service
    locationService.origin = 'http://localhost:4200';

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Content-Security-Policy')).toBeTrue();

    // Verify the request continues
    req.flush({ success: true });
  });

  it('should not add CSP headers to cross-origin requests', () => {
    httpClient.get('https://external-api.com/test').subscribe();

    const req = httpMock.expectOne('https://external-api.com/test');
    expect(req.request.headers.has('Content-Security-Policy')).toBeFalse();

    // Verify the request continues
    req.flush({ success: true });
  });

  it('should include all required CSP directives', () => {
    // Set the origin in our mock service
    locationService.origin = 'http://localhost:4200';

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    const cspHeader = req.request.headers.get('Content-Security-Policy');

    // Check for required directives
    expect(cspHeader).toContain('default-src');
    expect(cspHeader).toContain('script-src');
    expect(cspHeader).toContain('style-src');
    expect(cspHeader).toContain('font-src');
    expect(cspHeader).toContain('img-src');
    expect(cspHeader).toContain('connect-src');
    expect(cspHeader).toContain('frame-src');
    expect(cspHeader).toContain('media-src');
    expect(cspHeader).toContain('object-src');
    expect(cspHeader).toContain('base-uri');
    expect(cspHeader).toContain('form-action');
    expect(cspHeader).toContain('frame-ancestors');
    expect(cspHeader).toContain('upgrade-insecure-requests');

    // Verify the request continues
    req.flush({ success: true });
  });

  it('should include trusted domains in CSP policy', () => {
    // Test the getCSPPolicy method directly
    const cspPolicy = interceptor['getCSPPolicy']();

    // Check for trusted domains in different directives
    expect(cspPolicy).toContain('cdn.jsdelivr.net');
    expect(cspPolicy).toContain('cdnjs.cloudflare.com');
    expect(cspPolicy).toContain('fonts.googleapis.com');
    expect(cspPolicy).toContain('fonts.gstatic.com');
    expect(cspPolicy).toContain('cloudinary.com');
    expect(cspPolicy).toContain('unsplash.com');
    expect(cspPolicy).toContain('githubusercontent.com');
    expect(cspPolicy).toContain('example.com');
  });
});
