import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { ContentSanitizerService } from './content-sanitizer.service';

describe('ContentSanitizerService', () => {
  let service: ContentSanitizerService;
  let sanitizerSpy: jasmine.SpyObj<DomSanitizer>;

  beforeEach(() => {
    sanitizerSpy = jasmine.createSpyObj('DomSanitizer', [
      'bypassSecurityTrustUrl',
      'bypassSecurityTrustResourceUrl'
    ]);
    
    sanitizerSpy.bypassSecurityTrustUrl.and.returnValue('sanitized-url' as any);
    sanitizerSpy.bypassSecurityTrustResourceUrl.and.returnValue('sanitized-resource-url' as any);

    TestBed.configureTestingModule({
      providers: [
        ContentSanitizerService,
        { provide: DomSanitizer, useValue: sanitizerSpy }
      ]
    });
    
    service = TestBed.inject(ContentSanitizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('sanitizeUrl', () => {
    it('should sanitize absolute URLs', () => {
      const url = 'https://example.com/image.jpg';
      const result = service.sanitizeUrl(url);
      
      expect(sanitizerSpy.bypassSecurityTrustUrl).toHaveBeenCalledWith(url);
      expect(result).toBe('sanitized-url');
    });

    it('should handle relative URLs starting with /', () => {
      const url = '/assets/images/image.jpg';
      const result = service.sanitizeUrl(url);
      
      expect(sanitizerSpy.bypassSecurityTrustUrl).toHaveBeenCalledWith(url);
      expect(result).toBe('sanitized-url');
    });

    it('should prepend / to relative URLs not starting with /', () => {
      const url = 'assets/images/image.jpg';
      const result = service.sanitizeUrl(url);
      
      expect(sanitizerSpy.bypassSecurityTrustUrl).toHaveBeenCalledWith('/assets/images/image.jpg');
      expect(result).toBe('sanitized-url');
    });

    it('should return empty string for null or undefined URLs', () => {
      expect(service.sanitizeUrl(null as any)).toBe('');
      expect(service.sanitizeUrl(undefined as any)).toBe('');
      expect(sanitizerSpy.bypassSecurityTrustUrl).not.toHaveBeenCalled();
    });

    it('should handle errors and return empty string', () => {
      sanitizerSpy.bypassSecurityTrustUrl.and.throwError('Test error');
      
      const result = service.sanitizeUrl('https://example.com/image.jpg');
      
      expect(result).toBe('');
    });
  });

  describe('sanitizeResourceUrl', () => {
    it('should sanitize resource URLs', () => {
      const url = 'https://example.com/iframe-content';
      const result = service.sanitizeResourceUrl(url);
      
      expect(sanitizerSpy.bypassSecurityTrustResourceUrl).toHaveBeenCalledWith(url);
      expect(result).toBe('sanitized-resource-url');
    });

    it('should return empty string for null or undefined URLs', () => {
      expect(service.sanitizeResourceUrl(null as any)).toBe('');
      expect(service.sanitizeResourceUrl(undefined as any)).toBe('');
      expect(sanitizerSpy.bypassSecurityTrustResourceUrl).not.toHaveBeenCalled();
    });

    it('should handle errors and return empty string', () => {
      sanitizerSpy.bypassSecurityTrustResourceUrl.and.throwError('Test error');
      
      const result = service.sanitizeResourceUrl('https://example.com/iframe-content');
      
      expect(result).toBe('');
    });
  });

  describe('isValidUrl', () => {
    it('should validate absolute URLs', () => {
      expect(service.isValidUrl('https://example.com/image.jpg')).toBeTrue();
      expect(service.isValidUrl('http://example.com')).toBeTrue();
      expect(service.isValidUrl('ftp://example.com')).toBeTrue();
    });

    it('should validate relative URLs starting with /', () => {
      expect(service.isValidUrl('/assets/images/image.jpg')).toBeTrue();
      expect(service.isValidUrl('/api/data')).toBeTrue();
    });

    it('should reject invalid URLs', () => {
      expect(service.isValidUrl('not a url')).toBeFalse();
      expect(service.isValidUrl('http:/example.com')).toBeFalse(); // Missing slash
    });

    it('should reject null or empty URLs', () => {
      expect(service.isValidUrl(null as any)).toBeFalse();
      expect(service.isValidUrl(undefined as any)).toBeFalse();
      expect(service.isValidUrl('')).toBeFalse();
    });
  });
});