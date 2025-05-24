/// <reference types="jasmine" />

interface StringMatching extends jasmine.AsymmetricMatcher {
  asymmetricMatch(other: string): boolean;
}

declare namespace jasmine {
  interface Matchers<T> {
    toBeTruthy(): void;
    toBeFalsy(): void;
    toBe(expected: T): void;
    toBeTrue(): void;
    toBeFalse(): void;
    toEqual<E = T>(expected: E): void;
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
    objectContaining(sample: Partial<T>): T;
    stringMatching(expected: string | RegExp): string;
    not: Matchers<T>;
  }

  interface Spy {
    (...args: any[]): any;
    and: SpyAnd;
    calls: any;
    withArgs(...args: any[]): Spy;
  }

  interface SpyAnd<T = any> {
    callThrough(): Spy;
    returnValue(val: T): Spy;
    returnValues(...values: T[]): Spy;
    callFake(fn: (...args: any[]) => T): Spy;
    throwError(msg: string | Error): Spy;
    stub(): Spy;
  }

  interface SpyObj<T> {
    [key: string]: Spy;
  }

  function createSpyObj<T>(
    baseName: string,
    methodNames: Array<string> | { [key: string]: any },
    propertyNames?: Array<string>,
  ): SpyObj<T>;

  function any(classToMatch: any): AsymmetricMatcher;
  function objectContaining<T>(sample: Partial<T>): AsymmetricMatcher;
  function stringMatching(regex: string | RegExp): StringMatching;
}

interface ExpectStatic {
  <T = any>(actual: T): jasmine.Matchers<T>;
  stringMatching(expected: string | RegExp): StringMatching;
}

declare const expect: ExpectStatic;
