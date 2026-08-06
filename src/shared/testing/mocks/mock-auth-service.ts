/// <reference types="jest" />

import { signal, WritableSignal } from '@angular/core';

import { UidDto, UserInfoDto } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth/auth.service';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks';

/**
 * Test signals exposed by the mock so tests can mutate the underlying writable signals.
 */
export type MockAuthServiceTestSignals = {
  hasMobileNumber: WritableSignal<boolean>;
  isAdmin: WritableSignal<boolean>;
  isAuthenticated: WritableSignal<boolean>;
  isConsumer: WritableSignal<boolean>;
  isDataProvider: WritableSignal<boolean>;
  isImpersonating: WritableSignal<boolean>;
  isProducer: WritableSignal<boolean>;
  isSupporter: WritableSignal<boolean>;
  justLoggedIn: WritableSignal<boolean>;
  userInfo: WritableSignal<UserInfoDto | undefined>;
  userRoles: WritableSignal<string[]>;
  userUids: WritableSignal<UidDto[]>;
};

export type MockAuthService = MockifyWithWritableSignals<AuthService, MockAuthServiceTestSignals>;

/**
 * Factory that creates a fully-typed mock of `AuthService`.
 * Methods are jest mocks; signals are real signals and can be mutated via `__testSignals`.
 */
export function createMockAuthService(): MockAuthService {
  const hasMobileNumber = signal(true);
  const isAdmin = signal(false);
  const isAuthenticated = signal<boolean>(false);
  const isConsumer = signal(false);
  const isDataProvider = signal(false);
  const isImpersonating = signal(false);
  const isProducer = signal(false);
  const isSupporter = signal(false);
  const justLoggedIn = signal(false);
  const userInfo = signal<UserInfoDto | undefined>(undefined);
  const userRoles = signal([]);
  const userUids = signal([]);

  return {
    // Signals
    isAuthenticated,
    justLoggedIn,
    userInfo,
    userRoles,
    userUids,
    // Computed signals (keep as simple signals for tests)
    hasMobileNumber,
    isAdmin,
    isConsumer,
    isDataProvider,
    isImpersonating,
    isProducer,
    isSupporter,

    // Methods
    clearAuthorizedUidsCache: jest.fn(),
    getUserEmail: jest.fn().mockReturnValue(''),
    getUserFullName: jest.fn().mockReturnValue(''),
    getUserId: jest.fn().mockReturnValue(undefined),
    initializeAuth: jest.fn(),
    initializeAuthorizedUids: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    refreshUserInfo: jest.fn().mockResolvedValue(undefined),
    // test-only writable signals
    __testSignals: {
      hasMobileNumber,
      isAdmin,
      isAuthenticated,
      isConsumer,
      isDataProvider,
      isImpersonating,
      isProducer,
      isSupporter,
      justLoggedIn,
      userInfo,
      userRoles,
      userUids,
    },
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
  mobileNumber: '+4179123456789',
  phoneNumber: '+41611234567',
  userPreferences: { mainMenuOpened: false, dismissedMigratedIds: [] },
};
