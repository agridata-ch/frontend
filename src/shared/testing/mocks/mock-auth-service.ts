/// <reference types="jest" />

import { signal, WritableSignal } from '@angular/core';

import { UserInfoDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth/auth.service';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

/**
 * Test signals exposed by the mock so tests can mutate the underlying writable signals.
 */
export type MockAuthServiceTestSignals = {
  isProducer: WritableSignal<boolean>;
  isConsumer: WritableSignal<boolean>;
  isSupporter: WritableSignal<boolean>;
  userRoles: WritableSignal<string[]>;
  userInfo: WritableSignal<UserInfoDto | undefined>;
  isAuthenticated: WritableSignal<boolean>;
};

export type MockAuthService = MockifyWithWritableSignals<AuthService, MockAuthServiceTestSignals>;

/**
 * Factory that creates a fully-typed mock of `AuthService`.
 * Methods are jest mocks; signals are real signals and can be mutated via `__testSignals`.
 */
export function createMockAuthService(): MockAuthService {
  const isAuthenticated = signal<boolean>(false);
  const userInfo = signal<UserInfoDto | undefined>(undefined);
  const userRoles = signal([]);
  const isProducer = signal(false);
  const isConsumer = signal(false);
  const isSupporter = signal(false);

  return {
    // Signals
    isAuthenticated,
    userInfo,
    userRoles,

    // Computed signals (keep as simple signals for tests)
    isProducer,
    isConsumer,
    isSupporter,

    // Methods
    login: jest.fn(),
    logout: jest.fn(),
    getUserFullName: jest.fn().mockReturnValue(''),
    getUserEmail: jest.fn().mockReturnValue(''),
    initializeAuth: jest.fn(),
    // test-only writable signals
    __testSignals: { isProducer, isConsumer, isSupporter, userRoles, userInfo, isAuthenticated },
  } satisfies MockAuthService;
}

export const mockUserInfo: UserInfoDto = {
  addressCountry: 'CH',
  addressLocality: 'Basel',
  addressPostalCode: '4051',
  addressStreet: 'Testgasse 5',
  email: 'producer-081@agridata.ch',
  familyName: '081',
  givenName: 'Producer',
  ktIdP: '***081',
  lastLoginDate: '2025-08-29T09:55:33.589684',
  phoneNumber: '+4179123456789',
  userPreferences: { mainMenuOpened: false, dismissedMigratedIds: [] },
};
