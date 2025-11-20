import { signal, WritableSignal } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserPreferencesDto } from '@/entities/openapi';
import { UidDto } from '@/entities/openapi/model/uidDto';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

export type MockAgridataStateServiceTestSignals = {
  currentRouteWithoutQueryParams: WritableSignal<string | undefined>;
  userPreferences: WritableSignal<UserPreferencesDto>;
};

export type MockAgridataStateService = MockifyWithWritableSignals<
  AgridataStateService,
  MockAgridataStateServiceTestSignals
>;

export function createMockAgridataStateService(): MockAgridataStateService {
  const currentRouteWithoutQueryParams = signal<string | undefined>(undefined);
  const userPreferences = signal<UserPreferencesDto>({
    mainMenuOpened: false,
    dismissedMigratedIds: [],
  });
  return {
    activeUid: signal<string | undefined>(undefined),
    currentRoute: signal<string | undefined>('/some-page'),
    currentRouteWithoutQueryParams,
    userPreferences,
    getDefaultUid: jest.fn().mockReturnValue(undefined),
    isImpersonating: jest.fn().mockReturnValue(false),
    isNavigationOpen: signal(false),
    routeStart: signal<string | undefined>('/some-page'),
    setActiveUid: jest.fn(),
    setUids: jest.fn(),
    userUids: signal([]),
    userUidsLoaded: signal(false),
    setMainMenuOpened: jest.fn(),
    addConfirmedMiratedUids: jest.fn(),

    __testSignals: { currentRouteWithoutQueryParams, userPreferences },
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
