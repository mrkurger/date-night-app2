import { Request, Response, NextFunction } from 'express';
import { RequestSanitizer } from '../../../middleware/request-sanitizer.js';

describe('Request Sanitizer', () => {
  let sanitizer: RequestSanitizer;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    sanitizer = new RequestSanitizer();
    req = {
      body: {},
      query: {},
      params: {},
    };
    res = {};
    next = jest.fn();
  });

  describe('XSS Protection', () => {
    it('should sanitize XSS attempts in body', () => {
      req.body = {
        name: '<script>alert("xss")</script>Test Name',
        description: 'Normal text <Image src="x" onerror="alert(1)">',
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.body.name).not.toContain('<script>');
      expect(req.body.description).not.toContain('onerror');
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize XSS attempts in query parameters', () => {
      req.query = {
        search: '<script>alert("xss")</script>Test Search',
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.query.search).not.toContain('<script>');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('String Trimming', () => {
    it('should trim strings in request body', () => {
      req.body = {
        username: '  test-user  ',
        email: ' test@example.com ',
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.body.username).toBe('test-user');
      expect(req.body.email).toBe('test@example.com');
      expect(next).toHaveBeenCalled();
    });

    it('should handle nested objects', () => {
      req.body = {
        user: {
          name: '  Test User  ',
          address: {
            street: '  123 Main St  ',
            city: ' Oslo ',
          },
        },
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.body.user.name).toBe('Test User');
      expect(req.body.user.address.street).toBe('123 Main St');
      expect(req.body.user.address.city).toBe('Oslo');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Empty String Handling', () => {
    it('should convert empty strings to null when configured', () => {
      const sanitizer = new RequestSanitizer({ convertEmptyStringsToNull: true });

      req.body = {
        name: 'Test',
        description: '',
        notes: '   ',
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.body.name).toBe('Test');
      expect(req.body.description).toBeNull();
      expect(req.body.notes).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Array Handling', () => {
    it('should sanitize arrays in request body', () => {
      req.body = {
        tags: ['  tag1  ', '<script>tag2</script>', ' tag3 '],
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.body.tags[0]).toBe('tag1');
      expect(req.body.tags[1]).not.toContain('<script>');
      expect(req.body.tags[2]).toBe('tag3');
      expect(next).toHaveBeenCalled();
    });
  });

  describe('Non-String Values', () => {
    it('should preserve non-string values', () => {
      req.body = {
        age: 25,
        active: true,
        score: 99.9,
        dates: [new Date(), null, undefined],
      };

      sanitizer.sanitize(req as Request, res as Response, next);

      expect(req.body.age).toBe(25);
      expect(req.body.active).toBe(true);
      expect(req.body.score).toBe(99.9);
      expect(req.body.dates[0]).toBeInstanceOf(Date);
      expect(req.body.dates[1]).toBeNull();
      expect(req.body.dates[2]).toBeUndefined();
      expect(next).toHaveBeenCalled();
    });
  });
});
