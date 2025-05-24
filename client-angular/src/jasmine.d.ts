import { Observable } from 'rxjs';
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/messageservice';
import { ConfirmationService } from 'primeng/confirmationservice';
declare global {
  namespace jasmine {
    interface Matchers<T> {
      // Basic matchers
      toBe(expected: T): boolean;
      toBeDefined(): boolean;
      toBeFalse(): boolean;
      toBeFalsy(): boolean;
      toBeGreaterThan(expected: number): boolean;
      toBeGreaterThanOrEqual(expected: number): boolean;
      toBeLessThan(expected: number): boolean;
      toBeLessThanOrEqual(expected: number): boolean;
      toBeNaN(): boolean;
      toBeNegativeInfinity(): boolean;
      toBeNull(): boolean;
      toBePositiveInfinity(): boolean;
      toBeTrue(): boolean;
      toBeTruthy(): boolean;
      toBeUndefined(): boolean;
      toContain(expected: any): boolean;
      toEqual(expected: any): boolean;

      // Spy matchers
      toHaveBeenCalled(): boolean;
      toHaveBeenCalledTimes(expected: number): boolean;
      toHaveBeenCalledWith(...params: any[]): boolean;
      toHaveBeenCalledOnceWith(...params: any[]): boolean;

      // Other matchers
      toMatch(expected: string | RegExp): boolean;
      toThrow(expected?: any): boolean;
      toThrowError(expected?: any, message?: string): boolean;

      not: jasmine.Matchers<T>;
    }

    interface SpyAnd<T = any> {
      callThrough(): Spy<T>;
      returnValue(value: T): Spy<T>;
      returnValues(...args: T[]): Spy<T>;
      callFake(fn: (...args: any[]) => T): Spy<T>;
      throwError(error: any): Spy<T>;
      stub(): Spy<T>;
    }

    interface Spy<T = any> extends Function {
      (...params: any[]): T;
      and: SpyAnd<T>;
      calls: Calls;
      withArgs(...args: any[]): Spy<T>;
    }

    interface SpyObj<T> {
      [k: string]: Spy;
    }

    // PrimeNG specific spy types
    interface MessageServiceSpyObj extends SpyObj<MessageService> {
      add: Spy<void>;
      addAll: Spy<void>;
      clear: Spy<void>;
    }

    interface ConfirmationServiceSpyObj extends SpyObj<ConfirmationService> {
      confirm: Spy<void>;
      close: Spy<void>;
    }

    // PrimeNG specific types
    interface FileUploadEvent {
      files: File[];
      currentFiles: File[];
      originalEvent: Event;
    }

    interface Message {
      severity?: string;
      summary?: string;
      detail?: string;
      id?: any;
      key?: string;
      life?: number;
      sticky?: boolean;
      closable?: boolean;
      data?: any;
    }

    interface ConfirmEventType {
      accept: () => void;
      reject: () => void;
    }

    interface FileUploadHandlerEvent {
      files: File[];
      uploadHandler: (e: FileUploadEvent) => void;
    }

    // Helper functions
    function createSpy(name?: string, originalFn?: Function): Spy;
    function createSpyObj(baseName: string, methodNames: string[]): { [key: string]: Spy };
    function createSpyObj<T>(baseName: string, methodNames: string[]): SpyObj<T>;
    function createSpyObj(
      baseName: string,
      methodNames: string[],
      properties?: { [key: string]: any },
    ): any;

    interface Clock {
      install(): void;
      uninstall(): void;
      tick(ms?: number): void;
    }

    interface Calls {
      count(): number;
      any(): boolean;
      all(): boolean;
      allArgs(): any[];
      all(): any[];
      mostRecent(): any;
      first(): any;
      reset(): void;
    }
  }

  // Global expect function
  function expect<T>(actual: T): jasmine.Matchers<T>;
}
