// ===================================================
// TEST UTILITIES
// ===================================================
// This file contains shared utilities for testing
//
// COMMON UTILITIES:
// - createMockComponent: Creates a mock standalone component
// - createMockService: Creates a mock service with specified methods
// ===================================================
import { Component, Input, Type } from '@angular/core';

/**
 * Creates a mock standalone component with the given selector and inputs
 *
 * @param selector The component selector
 * @param inputs Optional array of input property names
 * @param template Optional template (defaults to empty content projection)
 * @returns A standalone component class
 *
 * @example
 * const MockHeaderComponent = createMockComponent('app-header', ['title', 'showMenu']);
 */
export function createMockComponent(
  selector: string,
  inputs: string[] = [],
  template = '<ng-content></ng-content>'
): Type<any> {
  @Component({
    selector,
    template,
    standalone: true,
    imports: [],
  })
  class MockComponent {
    // Dynamically add inputs
    constructor() {
      inputs.forEach(input => {
        this[input] = null;
      });
    }
  }

  // Add Input decorators
  inputs.forEach(input => {
    Input()(MockComponent.prototype, input);
  });

  return MockComponent;
}

/**
 * Creates a mock service with the specified methods
 *
 * @param methods Object containing method names and their return values
 * @returns A service class with the specified methods
 *
 * @example
 * const MockAuthService = createMockService({
 *   login: () => of({ success: true }),
 *   logout: () => of(null),
 *   isAuthenticated: () => true
 * });
 */
export function createMockService(methods: Record<string, any>): Type<any> {
  class MockService {
    constructor() {
      // Add all methods to the service instance
      Object.entries(methods).forEach(([key, value]) => {
        this[key] = typeof value === 'function' ? value : () => value;
      });
    }
  }

  return MockService;
}

/**
 * Creates a spy object with methods that return the specified values
 *
 * @param methods Object containing method names and their return values
 * @returns An object with jasmine spy methods
 *
 * @example
 * const notificationServiceSpy = createSpyObject({
 *   success: undefined,
 *   error: undefined,
 *   info: undefined
 * });
 */
export function createSpyObject(methods: Record<string, any>): any {
  const spy = {};

  Object.entries(methods).forEach(([key, value]) => {
    spy[key] = jasmine.createSpy(key).and.returnValue(value);
  });

  return spy;
}
