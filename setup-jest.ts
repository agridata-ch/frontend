import { TestBed } from '@angular/core/testing';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

import { createTranslocoTestingModule } from './src/shared/testing/transloco-testing.module';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [createTranslocoTestingModule()],
  });
});

Object.defineProperty(globalThis, 'crypto', {
  value: {
    // Preserve any existing crypto methods
    ...globalThis.crypto,
    // Add randomUUID implementation
    randomUUID: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replaceAll(/[xy]/g, (c) => {
        const r = Math.trunc(Math.random() * 16);
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
  },
});

/**
 * A simple mock implementation of ResizeObserver that does nothing.
 * This allows tests to run without errors in environments where ResizeObserver
 * is not available (like JSDOM).
 *
 * CommentLastReviewed: 2026-05-12
 */
class ResizeObserverMock {
  constructor(private readonly callback: ResizeObserverCallback) {}

  observe(): void {
    // no-op
  }

  unobserve(): void {
    // no-op
  }

  disconnect(): void {
    // no-op
  }
}

Object.defineProperty(globalThis, 'ResizeObserver', {
  value: ResizeObserverMock,
});

HTMLElement.prototype.scrollIntoView = jest.fn();

setupZonelessTestEnv();
