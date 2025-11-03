import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ROUTE_PATHS, USER_ROLES } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { HomeRedirectGuard } from './home-redirect.guard';

describe('HomeRedirectGuard', () => {
  let guard: HomeRedirectGuard;
  let authService: MockAuthService;
  let router: Router;
  let agridataStateService: MockAgridataStateService;
  beforeEach(() => {
    agridataStateService = createMockAgridataStateService();
    authService = createMockAuthService();

    const mockRouter = {
      createUrlTree: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HomeRedirectGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: mockRouter },
        { provide: AgridataStateService, useValue: agridataStateService },
      ],
    });

    guard = TestBed.inject(HomeRedirectGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true for unauthenticated users', () => {
    authService.isAuthenticated.set(false);

    const result = guard.canActivate();

    expect(result).toBe(true);
  });

  it('should redirect to consent request path for producers', () => {
    const urlTree = {} as UrlTree;
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);
    (router.createUrlTree as jest.Mock).mockReturnValue(urlTree);

    const result = guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    expect(result).toBe(urlTree);
  });

  it('should redirect to consent request path for supporter that is impersonating a producer', () => {
    const urlTree = {} as UrlTree;
    jest.spyOn(agridataStateService, 'isImpersonating').mockReturnValue(true);
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_SUPPORTER]);
    (router.createUrlTree as jest.Mock).mockReturnValue(urlTree);

    const result = guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    expect(result).toBe(urlTree);
  });

  it('should redirect to supporter path for supporter', () => {
    const urlTree = {} as UrlTree;
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_SUPPORTER]);
    (router.createUrlTree as jest.Mock).mockReturnValue(urlTree);
    authService.__testSignals.isSupporter.set(true);

    const result = guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.SUPPORT_PATH]);
    expect(result).toBe(urlTree);
  });

  it('should redirect to data requests path for consumers', () => {
    const urlTree = {} as UrlTree;
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER]);
    authService.__testSignals.isConsumer.set(true);

    (router.createUrlTree as jest.Mock).mockReturnValue(urlTree);

    const result = guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH]);
    expect(result).toBe(urlTree);
  });

  it('should return true for authenticated users with no specific role', () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([]);

    const result = guard.canActivate();

    expect(result).toBe(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
