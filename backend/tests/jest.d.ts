/// <reference types="jest" />

// Global Jest functions
declare global {
  function describe(name: string, fn: () => void): void;
  function it(name: string, fn: () => void | Promise<void>): void;
  function test(name: string, fn: () => void | Promise<void>): void;
  function expect(actual: any): jest.Matchers<any>;
  function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
  function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
  function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
  function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
  
  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(a: number, b: number): R;
    }
  }
}

export {};
