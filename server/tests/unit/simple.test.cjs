/**
 * Simple test to verify Jest is working with CommonJS
 */

const { describe, it, expect } = require('@jest/globals');

describe('Simple Test', () => {
  it('should pass', () => {
    expect(1 + 1).toBe(2);
  });
});
