import { Signal } from '@angular/core';

/**
 * Require-all-properties mock type: every property of T is required.
 * - Signal properties keep their original Signal type
 * - Function properties (non-signals) are converted to jest.Mock with the original args/return
 * - Non-function properties keep their original types
 */
export type Mockify<T> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  [K in keyof T]: T[K] extends Signal<infer _U>
    ? T[K]
    : T[K] extends (...args: infer A) => infer R
      ? jest.Mock<R, A>
      : T[K];
};

/**
 * Generic mock type that allows to override readOnly signals in tests.
 * TService: The service type to mock
 * TTestSignals: The type containing writable signals for testing (optional)
 *
 * Usage example:
 * type MyServiceTestSignals = { mySignal: WritableSignal<string> };
 * type StrictMockMyService = StrictMockWithTestSignals<MyService, MyServiceTestSignals>;
 * then use like this. mockService.__testSignals.mySignal.set('test value');
 */
export type MockifyWithWritableSignals<TService, TTestSignals = never> = Mockify<TService> &
  ([TTestSignals] extends [never]
    ? Record<string, never>
    : {
        __testSignals: TTestSignals;
      });
