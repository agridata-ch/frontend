// archunit 2.5 augments Vitest 4's global `VitestAssertion`, which Vitest 5 no longer reads.
// Re-declare the matcher on Vitest 5's `Matchers` so `expect(rule).toPassAsync()` type-checks.
// Remove once archunit ships Vitest 5 typings.
export {};

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- name must match Vitest's Matchers<T>
  interface Matchers<T> {
    toPassAsync(): Promise<void>;
  }
}
