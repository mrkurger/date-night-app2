import { Observable } from 'rxjs';

declare namespace jasmine {
  interface Matchers<T> {
    toBe(expected: T): Promise<void> | void;
    toBeCloseTo(expected: number, precision?: number): Promise<void> | void;
    toBeDefined(): Promise<void> | void;
    toBeFalse(): Promise<void> | void;
    toBeFalsy(): Promise<void> | void;
    toBeGreaterThan(expected: number): Promise<void> | void;
    toBeGreaterThanOrEqual(expected: number): Promise<void> | void;
    toBeLessThan(expected: number): Promise<void> | void;
    toBeLessThanOrEqual(expected: number): Promise<void> | void;
    toBeNaN(): Promise<void> | void;
    toBeNegativeInfinity(): Promise<void> | void;
    toBeNull(): Promise<void> | void;
    toBePositiveInfinity(): Promise<void> | void;
    toBeTrue(): Promise<void> | void;
    toBeTruthy(): Promise<void> | void;
    toBeUndefined(): Promise<void> | void;
    toContain(expected: any): Promise<void> | void;
    toEqual(expected: any): Promise<void> | void;
    toHaveBeenCalled(): Promise<void> | void;
    toHaveBeenCalledTimes(expected: number): Promise<void> | void;
    toHaveBeenCalledWith(...params: any[]): Promise<void> | void;
    toMatch(expected: string | RegExp): Promise<void> | void;
    toThrow(expected?: any): Promise<void> | void;
    toThrowError(expected?: any, message?: string): Promise<void> | void;
    not: jasmine.Matchers<T>;
  }

  interface SpyAnd<T = any> {
    callThrough(): Spy<T>;
    returnValue(value: T): Spy<T>;
    returnValues(...args: T[]): Spy<T>;
    callFake(fn: (...args: any[]) => T): Spy<T>;
    throwError(msg: string): Spy<T>;
    stub(): Spy<T>;
  }

  interface Spy<T = any> extends Function {
    (...params: any[]): T;
    and: SpyAnd<T>;
    calls: Calls;
    withArgs(...args: any[]): Spy<T>;
  }

  interface SpyObj<T> {
    [k: string]: Spy<T>;
  }

  function createSpy(name?: string, originalFn?: Function): Spy;
  function createSpyObj(baseName: string, methodNames: string[]): { [key: string]: Spy };
  function createSpyObj<T>(baseName: string, methodNames: string[]): SpyObj<T>;

  interface Clock {
    install(): void;
    uninstall(): void;
    tick(ms?: number): void;
  }
}
