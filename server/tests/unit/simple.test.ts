import type { jest } from '@jest/globals';
/**
 * Simple test to verify Jest is working with ES modules
 */

import { jest, describe, it, expect } from '@jest/globals';

describe('Simple Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
