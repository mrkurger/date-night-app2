import { Output } from '@angular/core';

///

///
///

declare global {
  namespace jasmine {
    interface Matchers {
      toBe(expected: any, expectationFailOutput?: any): boolean;
      toBeDefined(expectationFailOutput?: any): boolean;
      toBeFalse(expectationFailOutput?: any): boolean;
      toBeFalsy(expectationFailOutput?: any): boolean;
      toBeGreaterThan(expected: number, expectationFailOutput?: any): boolean;
      toBeGreaterThanOrEqual(expected: number, expectationFailOutput?: any): boolean;
      toBeLessThan(expected: number, expectationFailOutput?: any): boolean;
      toBeLessThanOrEqual(expected: number, expectationFailOutput?: any): boolean;
      toBeNaN(expectationFailOutput?: any): boolean;
      toBeNegativeInfinity(expectationFailOutput?: any): boolean;
      toBeNull(expectationFailOutput?: any): boolean;
      toBePositiveInfinity(expectationFailOutput?: any): boolean;
      toBeTrue(expectationFailOutput?: any): boolean;
      toBeTruthy(expectationFailOutput?: any): boolean;
      toBeUndefined(expectationFailOutput?: any): boolean;
      toContain(expected: any, expectationFailOutput?: any): boolean;
      toEqual(expected: any, expectationFailOutput?: any): boolean;
      toHaveBeenCalled(expectationFailOutput?: any): boolean;
      toHaveBeenCalledTimes(expected: number, expectationFailOutput?: any): boolean;
      toHaveBeenCalledWith(...params: any[]): boolean;
      toMatch(expected: string | RegExp, expectationFailOutput?: any): boolean;
      toThrow(expected?: any, expectationFailOutput?: any): boolean;
      toThrowError(expected?: any, message?: string, expectationFailOutput?: any): boolean;
      not: Matchers;
    }
  }
}
