/// <reference types="jest" />

import { ResourceRef, ResourceStatus, signal } from '@angular/core';

export class MockResources {
  static createMockResourceRef<T>(initialValue: T): ResourceRef<T> {
    const valueSignal = signal<T>(initialValue);
    const errorSignal = signal<Error | undefined>(undefined);
    const loadingSignal = signal<boolean>(false);
    const statusSignal = signal<ResourceStatus>('resolved');

    return {
      value: valueSignal,
      error: errorSignal,
      isLoading: loadingSignal,
      status: statusSignal,

      asReadonly: jest.fn(),
      reload: jest.fn().mockReturnValue(false),
      set: jest.fn((v: T) => valueSignal.set(v)),
      update: jest.fn((fn: (v: T) => T) => valueSignal.set(fn(valueSignal()))),

      hasValue(): this is ResourceRef<Exclude<T, undefined>> {
        return true;
      },

      destroy: jest.fn(),
    };
  }
}
