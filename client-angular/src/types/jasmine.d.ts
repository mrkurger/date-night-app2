///

interface StringMatching extends jasmine.AsymmetricMatcher {
  asymmetricMatch(other: string): boolean;
}

declare namespace jasmine {
  interface Matchers {
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBe(expected: T): void;
    toBeTrue(): void;
    toBeFalse(): void;
    toEqual(expected: E): void;
    toContain(expected: any): void;
    toHaveBeenCalled(): void;
    toHaveBeenCalledWith(...args: any[]): void;
    toHaveBeenCalledTimes(expected: number): void;
    toBeGreaterThan(expected: number): void;
    toBeGreaterThanOrEqual(expected: number): void;
    toBeLessThan(expected: number): void;
    toBeLessThanOrEqual(expected: number): void;
    toBeCloseTo(expected: number, precision?: number): void;
    toMatch(expected: string | RegExp): void;
    toThrow(expected?: any): void;
    toThrowError(expected?: new (...args: any[]) => Error | string | RegExp): void;
    objectContaining(sample: Partial): T;
    stringMatching(expected: string | RegExp): string;
    not: Matchers;
  }

  interface Spy {
    (...args: any[]): any;
    and: SpyAnd;
    calls: any;
    withArgs(...args: any[]): Spy;
  }

  interface SpyAnd {
    callThrough(): Spy;
    returnValue(val: T): Spy;
    returnValues(...values: T[]): Spy;
    callFake(fn: (...args: any[]) => T): Spy;
    throwError(msg: string | Error): Spy;
    stub(): Spy;
  }

  interface SpyObj {
    [key: string]: Spy;
  }

  function createSpyObj(
    baseName: string,
    methodNames: Array | { [key: string]: any },
    propertyNames?: Array,
  ): SpyObj;

  function any(classToMatch: any): AsymmetricMatcher;
  function objectContaining(sample: Partial): AsymmetricMatcher;
  function stringMatching(regex: string | RegExp): StringMatching;
}

interface ExpectStatic {
  (actual: T): jasmine.Matchers;
  stringMatching(expected: string | RegExp): StringMatching;
}

declare const expect: ExpectStatic;
