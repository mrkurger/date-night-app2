// server/tests/unit/middleware/url-validator.test.js

// ES Module imports
import { urlValidatorMiddleware, URLValidator } from '../../../middleware/url-validator.js';

// --- Mocking Express Request, Response, and Next ---
const mockRequest = (url, originalUrl, path, baseUrl) => ({
  url,
  originalUrl: originalUrl || url,
  path: path || url,
  baseUrl: baseUrl || '',
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// --- Spies for Console Methods ---
let consoleWarnSpy;
let consoleLogSpy; // For the "Detected problematic URL pattern" log at url-validator.js:31

describe('URL Validator Middleware and Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    URLValidator.routePatternCache.clear();
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('URLValidator.preprocessPathToRegexp (and internal preprocessPattern)', () => {
    it('should correctly process a valid simple path', () => {
      const path = '/users/profile';
      const processed = URLValidator.preprocessPathToRegexp(path);
      expect(processed).toBe('/users/profile');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.any(String)
      );
    });

    it('should correctly process paths with parameters', () => {
      const path = '/users/:id/details';
      const processed = URLValidator.preprocessPathToRegexp(path);
      expect(processed).toBe('/users/:id/details');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.any(String)
      );
    });

    it('should return "/" for an invalid pattern like "/test/:" and log a warning via console.warn', () => {
      const path = '/test/:';
      const processed = URLValidator.preprocessPathToRegexp(path);
      expect(processed).toBe('/');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.stringContaining(path)
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid route pattern:',
        path,
        expect.any(Error)
      );
    });

    it('should process full URLs by extracting pathname and search', () => {
      const path = 'http://example.com/api/data?param=value';
      const processed = URLValidator.preprocessPathToRegexp(path);
      expect(processed).toBe('/api/data?param=value');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.any(String)
      );
    });

    it('should process "https://git.new/pathToRegexpError" by extracting the path', () => {
      const path = 'https://git.new/pathToRegexpError';
      const processed = URLValidator.preprocessPathToRegexp(path);
      expect(processed).toBe('/pathToRegexpError');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.any(String)
      );
    });

    it('should return "/" for "https://git.new/some:path/:" and log a warning via console.warn with the original problematic full URL', () => {
      const path = 'https://git.new/some:path/:'; // Full URL with invalid parameter
      const processed = URLValidator.preprocessPathToRegexp(path);
      // This will return "/" because validateRoutePath inside preprocessPathToRegexp
      // will fail when pathToRegexp is called with the problematic string.
      expect(processed).toBe('/');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.stringContaining(path)
      );
      // Expecting the path-to-regexp failure warning from URLValidator.validateRoutePath
      // The crucial change is here: expecting the *original* full path in the warning.
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid route pattern:',
        path, // Expecting the original full path 'https://git.new/some:path/:'
        expect.any(Error) // The error from path-to-regexp (e.g., "Missing parameter name")
      );
    });

    it('should correctly encode paths with spaces (single encoding)', () => {
      const path = '/path/with spaces';
      const processed = URLValidator.preprocessPathToRegexp(path);
      expect(processed).toBe('/path/with%20spaces');
      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Detected problematic URL pattern'),
        expect.any(String)
      );
    });
  });

  describe('urlValidatorMiddleware', () => {
    it('should call next() and not alter req.url for a simple valid request URL', () => {
      const req = mockRequest('/valid/path');
      const res = mockResponse();
      urlValidatorMiddleware(req, res, mockNext);
      expect(req.url).toBe('/valid/path');
      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should modify req.url for a full URL by extracting path and query', () => {
      const originalFullUrl = 'http://localhost:3000/api/test';
      const req = mockRequest(originalFullUrl);
      const res = mockResponse();
      urlValidatorMiddleware(req, res, mockNext);
      expect(req.url).toBe('/api/test');
      expect(req.path).toBe('/api/test');
      expect(req.originalUrl).toBe('/api/test');
      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should set req.url to "/" if req.url like "/test/:" causes path-to-regexp error', () => {
      const problematicPath = '/test/:';
      const req = mockRequest(problematicPath);
      const res = mockResponse();
      urlValidatorMiddleware(req, res, mockNext);
      expect(req.url).toBe('/');
      expect(req.path).toBe('/');
      expect(req.originalUrl).toBe('/');
      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Invalid route pattern:',
        problematicPath,
        expect.any(Error)
      );
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should process req.url containing "https://git.new/pathToRegexpError" by extracting path', () => {
      const problematicUrl = 'https://git.new/pathToRegexpError';
      const req = mockRequest(problematicUrl);
      const res = mockResponse();
      urlValidatorMiddleware(req, res, mockNext);
      expect(req.url).toBe('/pathToRegexpError');
      expect(req.originalUrl).toBe('/pathToRegexpError');
      expect(req.path).toBe('/pathToRegexpError');
      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should transform req.url for "/api/resource/https://problem.com/path" based on sanitizeURL and encodePathSegment', () => {
      const complexProblematicPath = '/api/resource/https://problem.com/path';
      const req = mockRequest(complexProblematicPath);
      const res = mockResponse();
      urlValidatorMiddleware(req, res, mockNext);
      expect(req.url).toBe('/api/resource/https%3A/problem_DOT_com/path');
      expect(mockNext).toHaveBeenCalledWith();
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should correctly add helper methods and raw URL properties to req object', () => {
      const initialUrl = '/test/path?query=123';
      const initialOriginalUrl = '/original/path?query=abc';
      const initialPath = '/test/path';
      const initialBaseUrl = '/base';

      const req = mockRequest(initialUrl, initialOriginalUrl, initialPath, initialBaseUrl);
      const res = mockResponse();
      urlValidatorMiddleware(req, res, mockNext);

      expect(req.rawUrl).toBe(initialUrl);
      expect(req.rawOriginalUrl).toBe(initialOriginalUrl);
      expect(req.rawPath).toBe(initialPath);
      expect(req.rawBaseUrl).toBe(initialBaseUrl);
      expect(typeof req.getSanitizedUrl).toBe('function');
      expect(typeof req.getOriginalUrl).toBe('function');
      expect(typeof req.getDecodedUrl).toBe('function');
      expect(req.getOriginalUrl()).toBe(initialOriginalUrl);
    });
  });

  describe('URLValidator.sanitizeURL', () => {
    it('should sanitize and encode segments of a path-only URL as per its specific logic', () => {
      const originalUrl = '/path with spaces/and:colons/';
      const sanitized = URLValidator.sanitizeURL(originalUrl);
      expect(sanitized).toBe('/path with spaces/and_COLON_colons');
    });

    it('should extract path and query from a full URL and sanitize path segments', () => {
      const fullUrl = 'http://example.com/path/to/data?key=value&other:key=other_value';
      const sanitized = URLValidator.sanitizeURL(fullUrl);
      expect(sanitized).toBe('/path/to/data?key=value&other:key=other_value');
    });
  });
});
