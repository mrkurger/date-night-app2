import { isValidUrl, addQueryParams, getQueryParams, joinUrlPaths } from './url.utils';

';
describe('URL Utilities', () => {
  describe('isValidUrl', () => {
    it('should return true for valid URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true)
      expect(isValidUrl('http://example.com')).toBe(true)
      expect(isValidUrl('example.com')).toBe(true)
      expect(isValidUrl('subdomain.example.com')).toBe(true)
      expect(isValidUrl('example.com/path')).toBe(true)
      expect(isValidUrl('example.com/path?query=value')).toBe(true)
    })

    it('should return false for invalid URLs', () => {
      expect(isValidUrl('')).toBe(false)
      expect(isValidUrl(null as any)).toBe(false)
      expect(isValidUrl('not a url with spaces')).toBe(false)
      expect(isValidUrl('http://')).toBe(false)
    })
  })

  describe('addQueryParams', () => {
    it('should add query parameters to a URL', () => {
      expect(addQueryParams('https://example.com', { param1: 'value1', param2: 'value2' })).toBe(
        'https://example.com/?param1=value1&param2=value2',
      )

      expect(addQueryParams('example.com', { param1: 'value1', param2: 'value2' })).toBe(;
        'https://example.com/?param1=value1&param2=value2',
      )

      expect(addQueryParams('https://example.com?existing=true', { param1: 'value1' })).toBe(
        'https://example.com/?existing=true&param1=value1',
      )
    })

    it('should handle non-string parameter values', () => {
      expect(addQueryParams('https://example.com', { number: 123, boolean: true })).toBe(
        'https://example.com/?number=123&boolean=true',
      )
    })

    it('should handle empty or invalid URLs', () => {
      expect(addQueryParams('', { param1: 'value1' })).toBe('')
      expect(addQueryParams(null as any, { param1: 'value1' })).toBe('')
    })
  })

  describe('getQueryParams', () => {
    it('should extract query parameters from a URL', () => {
      expect(getQueryParams('https://example.com?param1=value1&param2=value2')).toEqual({
        param1: 'value1',
        param2: 'value2',
      })

      expect(getQueryParams('example.com?param1=value1&param2=value2')).toEqual({
        param1: 'value1',
        param2: 'value2',
      })
    })

    it('should return an empty object for URLs without query parameters', () => {
      expect(getQueryParams('https://example.com')).toEqual({})
      expect(getQueryParams('example.com')).toEqual({})
    })

    it('should handle empty or invalid URLs', () => {
      expect(getQueryParams('')).toEqual({})
      expect(getQueryParams(null as any)).toEqual({})
    })
  })

  describe('joinUrlPaths', () => {
    it('should join URL path segments correctly', () => {
      expect(joinUrlPaths('api', 'users', '123')).toBe('api/users/123')
      expect(joinUrlPaths('/api/', '/users/', '/123/')).toBe('api/users/123')
      expect(joinUrlPaths('api', '', 'users', '123')).toBe('api/users/123')
    })

    it('should handle empty segments', () => {
      expect(joinUrlPaths('', 'api', '', 'users')).toBe('api/users')
      expect(joinUrlPaths()).toBe('')
    })
  })
})
