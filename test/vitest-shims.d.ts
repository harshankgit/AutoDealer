// Minimal local shims so the TypeScript server recognizes Vitest globals
declare function describe(name: string, fn: () => void): void;
declare function it(name: string, fn: () => void): void;
declare function beforeEach(fn: () => void): void;
declare function afterEach(fn: () => void): void;
declare function expect(actual: any): any;
declare const vi: any;

export {};
