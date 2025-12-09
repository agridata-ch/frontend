import { signal, WritableSignal } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserPreferencesDto } from '@/entities/openapi';
import { UidDto } from '@/entities/openapi/model/uidDto';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

export type MockAgridataStateServiceTestSignals = {
  currentRouteWithoutQueryParams: WritableSignal<string | undefined>;
  currentRoute: WritableSignal<string | undefined>;
  userPreferences: WritableSignal<UserPreferencesDto>;
  activeUid: WritableSignal<string | undefined>;
  backendInfo: WritableSignal<{ [key: string]: string } | undefined>;
};

export type MockAgridataStateService = MockifyWithWritableSignals<
  AgridataStateService,
  MockAgridataStateServiceTestSignals
>;
export const BE_VERSION = '1.0.0';

export function createMockAgridataStateService(): MockAgridataStateService {
  const currentRouteWithoutQueryParams = signal<string | undefined>(undefined);
  const currentRoute = signal<string | undefined>('/some-page');
  const userPreferences = signal<UserPreferencesDto>({
    mainMenuOpened: false,
    dismissedMigratedIds: [],
  });
  const activeUid = signal<string | undefined>(undefined);
  const backendInfo = signal({ version: BE_VERSION });
  return {
    activeUid,
    currentRoute,
    currentRouteWithoutQueryParams,
    userPreferences,
    backendInfo,
    getDefaultUid: jest.fn().mockReturnValue(undefined),
    isImpersonating: jest.fn().mockReturnValue(false),
    routeStart: signal<string | undefined>('/some-page'),
    setActiveUid: jest.fn(),
    setMainMenuOpened: jest.fn(),
    addConfirmedMigratedUids: jest.fn(),
    hideCookieBanner: jest.fn(),
    showCookiebanner: signal(true),
    __testSignals: {
      currentRouteWithoutQueryParams,
      userPreferences,
      activeUid,
      currentRoute,
      backendInfo,
    },
  } satisfies MockAgridataStateService;
}

export const mockUids = [
  {
    uid: '1',
    name: 'Alpha',
  } as UidDto,
  {
    uid: '2',
    name: 'Beta',
  } as UidDto,
  {
    uid: '3',
    name: undefined, // This will test sorting with undefined names
  } as UidDto,
];
