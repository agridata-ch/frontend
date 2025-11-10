import { TestBed } from '@angular/core/testing';
import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

import { createTranslocoTestingModule } from './src/shared/testing/transloco-testing.module';

beforeEach(() => {
  TestBed.configureTestingModule({
    imports: [createTranslocoTestingModule()],
  });
});

// Mock the crypto.randomUUID API for Jest tests because it is not implemented in JSDOM. This is provided by the browser normally.
Object.defineProperty(global, 'crypto', {
  value: {
    // Preserve any existing crypto methods
    ...(global.crypto || {}),
    // Add randomUUID implementation
    randomUUID: () =>
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }),
  },
});
setupZonelessTestEnv();
