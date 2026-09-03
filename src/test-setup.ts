import { setupTestBed } from '@analogjs/vitest-angular/setup-testbed';
import { TestBed } from '@angular/core/testing';
import { beforeEach, vi } from 'vitest';

import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

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
 * CommentLastReviewed: 2026-09-03
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

HTMLElement.prototype.scrollIntoView = vi.fn();

// jsdom's real window.close() destroys the window and breaks localStorage for every
// later test in the worker. Stub it (jest-environment-jsdom treated it as a no-op).
// Tests can still vi.spyOn(window, 'close') to assert it was called.
window.close = () => {};

// Initialises the zoneless Angular TestBed environment (replaces
// jest-preset-angular's setupZonelessTestEnv). Defaults to zoneless: true.
setupTestBed();
