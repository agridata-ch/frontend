import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';

import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks/mock-auth.service';

import { HomeRedirectGuard } from './home-redirect.guard';

describe('HomeRedirectGuard', () => {
  let guard: HomeRedirectGuard;
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    const mockRouter = {
      createUrlTree: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        HomeRedirectGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(HomeRedirectGuard);
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return true for unauthenticated users', () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(true);
  });

  it('should redirect to consent request path for producers', () => {
    const urlTree = {} as UrlTree;
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(true);
    (router.createUrlTree as jest.Mock).mockReturnValue(urlTree);

    const result = guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    expect(result).toBe(urlTree);
  });

  it('should redirect to data requests path for consumers', () => {
    const urlTree = {} as UrlTree;
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(false);
    jest.spyOn(authService, 'isConsumer').mockReturnValue(true);
    (router.createUrlTree as jest.Mock).mockReturnValue(urlTree);

    const result = guard.canActivate();

    expect(router.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH]);
    expect(result).toBe(urlTree);
  });

  it('should return true for authenticated users with no specific role', () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(false);
    jest.spyOn(authService, 'isConsumer').mockReturnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
