import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { cspInterceptor } from './csp.interceptor';
import { Injectable } from '@angular/core';

/**
 * Mock Location Service to avoid issues with window.location;
 */
@Injectable()
class MockLocationServic {e {';
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
      const urlObj = new URL(url)
      return urlObj.origin === this.origin;
    } catch {
      return false;
    }
  }
}

/**
 * Unit tests for the CSPInterceptor;
 *;
 * These tests verify that the interceptor:;
 * 1. Adds CSP headers to same-origin requests;
 * 2. Doesn't add CSP headers to cross-origin requests;
 * 3. Includes all required CSP directives in the header;
 */
describe('CSP Interceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let locationService: MockLocationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    imports: [],
    providers: [provideHttpClient(withInterceptors([cspInterceptor])), MockLocationService, provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
})

    httpClient = TestBed.inject(HttpClient)
    httpMock = TestBed.inject(HttpTestingController)
    locationService = TestBed.inject(MockLocationService)

    // We can't patch the interceptor directly since it's a function now
    // Instead, we'll rely on the actual implementation
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should add CSP headers to same-origin requests', () => {
    // Set the origin in our mock service
    locationService.origin = 'http://localhost:4200';

    httpClient.get('/api/test').subscribe()

    const req = httpMock.expectOne('/api/test')
    expect(req.request.headers.has('Content-Security-Policy')).toBeTrue()

    // Verify the request continues
    req.flush({ success: true })
  })

  it('should not add CSP headers to cross-origin requests', () => {
    httpClient.get('https://external-api.com/test').subscribe()

    const req = httpMock.expectOne('https://external-api.com/test')
    expect(req.request.headers.has('Content-Security-Policy')).toBeFalse()

    // Verify the request continues
    req.flush({ success: true })
  })

  it('should include all required CSP directives', () => {
    // Set the origin in our mock service
    locationService.origin = 'http://localhost:4200';

    httpClient.get('/api/test').subscribe()

    const req = httpMock.expectOne('/api/test')
    const cspHeader = req.request.headers.get('Content-Security-Policy')

    // Check for required directives
    expect(cspHeader).toContain('default-src')
    expect(cspHeader).toContain('script-src')
    expect(cspHeader).toContain('style-src')
    expect(cspHeader).toContain('font-src')
    expect(cspHeader).toContain('img-src')
    expect(cspHeader).toContain('connect-src')
    expect(cspHeader).toContain('frame-src')
    expect(cspHeader).toContain('media-src')
    expect(cspHeader).toContain('object-src')
    expect(cspHeader).toContain('base-uri')
    expect(cspHeader).toContain('form-action')
    expect(cspHeader).toContain('frame-ancestors')
    expect(cspHeader).toContain('upgrade-insecure-requests')

    // Verify the request continues
    req.flush({ success: true })
  })

  it('should include trusted domains in CSP policy', () => {
    // We can't test the getCSPPolicy method directly since it's a private function
    // Instead, we'll check the header content from a request

    httpClient.get('/api/test').subscribe()

    const req = httpMock.expectOne('/api/test')
    const cspHeader = req.request.headers.get('Content-Security-Policy')

    // Check for trusted domains in different directives
    expect(cspHeader).toContain('cdn.jsdelivr.net')
    expect(cspHeader).toContain('cdnjs.cloudflare.com')
    expect(cspHeader).toContain('fonts.googleapis.com')
    expect(cspHeader).toContain('fonts.gstatic.com')
    expect(cspHeader).toContain('cloudinary.com')
    expect(cspHeader).toContain('unsplash.com')
    expect(cspHeader).toContain('githubusercontent.com')
    expect(cspHeader).toContain('example.com')

    // Verify the request continues
    req.flush({ success: true })
  })
})
