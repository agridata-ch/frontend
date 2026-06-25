import { DOCUMENT, Provider } from '@angular/core';

/**
 * Test helper that provides a DOCUMENT whose `location` is a mutable plain object while every other
 * member is delegated to the real jsdom document, so Angular's renderer keeps working. This is
 * required because jsdom 26 (Angular 22 toolchain) fully locks window.location: it can no longer be
 * stubbed via Object.defineProperty, delete, or jest spies. Components therefore read/write location
 * through the injected DOCUMENT, which this helper makes mockable.
 *
 * CommentLastReviewed: 2026-06-25
 */
export interface MockLocation {
  href: string;
  origin: string;
}

export interface MockDocumentResult {
  location: MockLocation;
  provider: Provider;
}

export function createMockDocument(location: Partial<MockLocation> = {}): MockDocumentResult {
  const mockLocation: MockLocation = {
    href: '',
    origin: 'http://localhost',
    ...location,
  };

  const realDocument = document;
  const proxy = new Proxy(realDocument, {
    get(target, property): unknown {
      if (property === 'location') {
        return mockLocation;
      }
      const value = Reflect.get(target, property, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  return {
    location: mockLocation,
    provider: { provide: DOCUMENT, useValue: proxy },
  };
}
