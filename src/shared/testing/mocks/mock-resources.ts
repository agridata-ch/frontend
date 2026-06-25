/// <reference types="jest" />

import {
  computed,
  ResourceRef,
  ResourceSnapshot,
  ResourceStatus,
  Signal,
  signal,
} from '@angular/core';

/**
 * Supplies mock data objects and constants used across different tests.
 *
 * CommentLastReviewed: 2025-08-25
 */
export class MockResources {
  static createMockResourceRef<T>(
    initialValue: T,
    loadingSignal?: Signal<boolean>,
  ): ResourceRef<T> {
    const valueSignal = signal<T>(initialValue);
    const errorSignal = signal<Error | undefined>(undefined);
    const statusSignal = signal<ResourceStatus>('resolved');

    const snapshotSignal: Signal<ResourceSnapshot<T>> = computed(() => {
      const status = statusSignal();
      if (status === 'error') {
        return { status, error: errorSignal() ?? new Error('Mock resource error') };
      }
      if (status === 'idle') {
        return { status, value: valueSignal() };
      }
      if (status === 'loading' || status === 'reloading') {
        return { status, value: valueSignal() };
      }
      return { status, value: valueSignal() };
    });

    return {
      value: valueSignal,
      error: errorSignal,
      isLoading: loadingSignal ?? signal(false),
      status: statusSignal,
      snapshot: snapshotSignal,

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
