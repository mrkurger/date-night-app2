import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { CSPInterceptor } from './csp.interceptor';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        CSPInterceptor,
        { provide: HTTP_INTERCEPTORS, useClass: CSPInterceptor, multi: true }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    interceptor = TestBed.inject(CSPInterceptor);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add CSP headers to same-origin requests', () => {
    // Mock window.location.origin
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:4200'
      },
      writable: true
    });

    httpClient.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Content-Security-Policy')).toBeTrue();
    
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
  });

  it('should not add CSP headers to cross-origin requests', () => {
    httpClient.get('https://external-api.com/test').subscribe();

    const req = httpMock.expectOne('https://external-api.com/test');
    expect(req.request.headers.has('Content-Security-Policy')).toBeFalse();
  });

  it('should include all required CSP directives', () => {
    // Mock window.location.origin
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://localhost:4200'
      },
      writable: true
    });

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
    
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true
    });
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