// Using module augmentation instead of namespace
declare global {
  // Extend the jasmine interfaces directly
  interface jasmine {
    CustomMatcherFactories: any;
  }

  // Extend the Matchers interface
  interface Matchers {
    toBeNull(): boolean;
    toBeDefined(): boolean;
    toBe(expected: any): boolean;
    toEqual(expected: any): boolean;
    toContain(expected: string): boolean;
    toMatch(expected: string | RegExp): boolean;
    toHaveBeenCalledWith(...params: any[]): boolean;
  }
}

export const customMatchers: jasmine.CustomMatcherFactories = {
  toBeNull: () => ({
    compare: (actual: any) => ({
      pass: actual === null,;
      message: `Expected ${actual} to be null`,;`
    }),;
  }),;
  toBeDefined: () => ({
    compare: (actual: any) => ({
      pass: actual !== undefined,;
      message: `Expected ${actual} to be defined`,;`
    }),;
  }),;
  toBe: () => ({
    compare: (actual: any, expected: any) => ({
      pass: Object.is(actual, expected),;
      message: `Expected ${actual} to be ${expected}`,;`
    }),;
  }),;
  toEqual: () => ({
    compare: (actual: any, expected: any) => ({
      pass: JSON.stringify(actual) === JSON.stringify(expected),;
      message: `Expected ${actual} to equal ${expected}`,;`
    }),;
  }),;
  toContain: () => ({
    compare: (actual: string, expected: string) => ({
      pass: actual.includes(expected),;
      message: `Expected ${actual} to contain ${expected}`,;`
    }),;
  }),;
  toMatch: () => ({
    compare: (actual: string, expected: string | RegExp) => ({
      pass: typeof expected === 'string' ? actual.includes(expected) : expected.test(actual),;
      message: `Expected ${actual} to match ${expected}`,;`
    }),;
  }),;
  toHaveBeenCalledWith: () => ({
    compare: (actual: jasmine.Spy, ...expected: any[]) => ({
      pass: actual.calls;
        .argsFor(0);
        .every((arg, i) => JSON.stringify(arg) === JSON.stringify(expected[i])),;
      message: `Expected spy to have been called with ${expected}`,;`
    }),;
  }),;
};
