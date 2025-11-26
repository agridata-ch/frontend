import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';

import { BackendInfoService } from '@/entities/api/backend-info.service';
import { UserService } from '@/entities/api/user.service';
import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { BE_VERSION } from '@/shared/testing/mocks/mock-agridata-state-service';
import {
  createMockAuthService,
  MockAuthService,
  mockUserInfo,
} from '@/shared/testing/mocks/mock-auth-service';
import { createMockUserService, MockUserService } from '@/shared/testing/mocks/mock-user-service';

import { AgridataStateService, DISMISSED_MIGRATIONS_KEY } from './agridata-state.service';

const createMockBackendVersionService = () =>
  ({
    fetchBackendInfo: jest.fn().mockResolvedValue({ version: BE_VERSION }),
  }) satisfies Partial<BackendInfoService>;

describe('AgridataStateService', () => {
  let service: AgridataStateService;
  let mockRouter: Partial<Router>;
  let userService: MockUserService;
  let authService: MockAuthService;
  let backendVersionService: ReturnType<typeof createMockBackendVersionService>;

  beforeEach(() => {
    mockRouter = {
      url: '/initial',
      events: of(new NavigationEnd(1, '/initial', '/initial')),
    };
    backendVersionService = createMockBackendVersionService();

    userService = createMockUserService();
    authService = createMockAuthService();

    TestBed.configureTestingModule({
      providers: [
        AgridataStateService,
        { provide: Router, useValue: mockRouter },
        { provide: UserService, useValue: userService },
        { provide: AuthService, useValue: authService },
        { provide: BackendInfoService, useValue: backendVersionService },
      ],
    });

    service = TestBed.inject(AgridataStateService);
  });

  afterEach(() => {
    localStorage.removeItem(DISMISSED_MIGRATIONS_KEY);
    sessionStorage.removeItem('ktidp_impersonation');
  });

  it('initializes user preferences when auth userInfo is available', () => {
    authService.__testSignals.userInfo.set(mockUserInfo);

    TestBed.tick();

    expect(service.userPreferences()?.mainMenuOpened).toBe(false);
    expect(service.userPreferences()?.dismissedMigratedIds).toEqual([]);
  });

  it('setActiveUid updates preferences and calls userService.updateUserPreferences', async () => {
    userService.updateUserPreferences = jest.fn().mockReturnValue(Promise.resolve());

    await service.setActiveUid('ABC');

    expect(service.activeUid()).toBe('ABC');
    expect(userService.updateUserPreferences).toHaveBeenCalled();
  });

  it('getDefaultUid returns stored active uid when present otherwise first uid', () => {
    // set active via public API
    service.setActiveUid('stored-uid');

    const uids = [{ uid: 'stored-uid' }, { uid: 'other' }] as any;
    expect(service.getDefaultUid(uids)).toBe('stored-uid');

    // when stored not in list
    service.setActiveUid('missing');
    expect(service.getDefaultUid(uids)).toBe('stored-uid');

    // empty list -> null
    expect(service.getDefaultUid([])).toBeNull();
  });

  it('isImpersonating reads sessionStorage', () => {
    sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, '1');
    expect(service.isImpersonating()).toBe(true);

    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);
    expect(service.isImpersonating()).toBe(false);
  });

  it('addConfirmedMiratedUids appends ids and calls updateUserPreferences', async () => {
    userService.updateUserPreferences = jest.fn().mockReturnValue(Promise.resolve());

    // ensure initial prefs empty
    authService.__testSignals.userInfo.set(mockUserInfo);

    service.addConfirmedMigratedUids(['a', 'b']);

    expect(service.userPreferences()?.dismissedMigratedIds).toEqual(['a', 'b']);
    expect(userService.updateUserPreferences).toHaveBeenCalled();
  });
});
