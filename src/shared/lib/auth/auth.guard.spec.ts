import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AGATE_LOGIN_ID_IMPERSONATION_HEADER, ROUTE_PATHS } from '@/shared/constants/constants';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';

import { AuthorizationGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let mockRouter: Partial<Router>;
  let fakeUrlTree: UrlTree;
  let authService: MockAuthService;
  let errorService: MockErrorHandlerService;
  let mockActivatedRouteSnapshot: ActivatedRouteSnapshot;

  beforeEach(() => {
    // Create a dummy UrlTree; we only check identity in our expectations.
    fakeUrlTree = new UrlTree();

    mockRouter = {
      parseUrl: jest.fn().mockReturnValue(fakeUrlTree),
    };
    mockActivatedRouteSnapshot = {
      queryParamMap: {
        get: jest.fn().mockReturnValue(undefined),
      },
      data: { roles: [] },
      url: {},
    } as unknown as ActivatedRouteSnapshot;
    authService = createMockAuthService();
    errorService = createMockErrorHandlerService();
    TestBed.configureTestingModule({
      providers: [
        AuthorizationGuard,
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: authService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    });

    guard = TestBed.inject(AuthorizationGuard);
  });

  it('allows activation when no roles are required', async () => {
    authService.initializeAuth.mockResolvedValue(true);

    const result = await guard.canActivate(mockActivatedRouteSnapshot);

    expect(result).toBe(true);
  });

  it('denies activation when required role is missing and redirects to forbidden', async () => {
    authService.initializeAuth.mockResolvedValue(true);
    authService.__testSignals.userInfo.set({ rolesAtLastLogin: ['ROLE_USER'] });
    mockActivatedRouteSnapshot.data = { roles: ['ROLE_ADMIN'] };

    const result = await guard.canActivate(mockActivatedRouteSnapshot);

    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('allows activation when user has one of the required roles', async () => {
    authService.initializeAuth.mockResolvedValue(true);
    authService.__testSignals.userInfo.set({ rolesAtLastLogin: ['ROLE_ADMIN', 'ROLE_USER'] });

    mockActivatedRouteSnapshot.data = { roles: ['ROLE_ADMIN'] };

    const result = await guard.canActivate(mockActivatedRouteSnapshot);

    expect(result).toBe(true);
  });

  it('handles errors from initializeAuth by sending them to errorService and redirecting to error route', async () => {
    const testError = new Error('Test initializeAuth error');
    authService.initializeAuth.mockRejectedValue(testError);

    const result = await guard.canActivate(mockActivatedRouteSnapshot);

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
  });

  it('ignores errors when on error page and returns true', async () => {
    const testError = new Error('Test initializeAuth error');
    authService.initializeAuth.mockRejectedValue(testError);
    (mockActivatedRouteSnapshot as any).url = [ROUTE_PATHS.ERROR];

    const result = await guard.canActivate(mockActivatedRouteSnapshot);

    expect(errorService.handleError).toHaveBeenCalledTimes(0);
    expect(result).toBe(true);
    expect(mockRouter.parseUrl).toHaveBeenCalledTimes(0);
  });

  it('should set header in sessionStorage when query param is present', async () => {
    // Arrange
    const testAgateLoginId = 'test-agateLoginId';
    (mockActivatedRouteSnapshot.queryParamMap?.get as jest.Mock).mockReturnValue(testAgateLoginId);
    authService.initializeAuth.mockResolvedValue(true);
    sessionStorage.removeItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER);

    // Act
    await guard.canActivate(mockActivatedRouteSnapshot as ActivatedRouteSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap?.get).toHaveBeenCalledWith(
      AGATE_LOGIN_ID_IMPERSONATION_HEADER,
    );
    expect(sessionStorage.getItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER)).toBe(testAgateLoginId);

    // Clean up
    sessionStorage.removeItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER);
  });

  it('should not set header in sessionStorage when query param is not present', async () => {
    // Arrange

    authService.initializeAuth.mockResolvedValue(true);

    // Clear any previous values
    sessionStorage.removeItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER);

    // Act
    await guard.canActivate(mockActivatedRouteSnapshot as ActivatedRouteSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap?.get).toHaveBeenCalledWith(
      AGATE_LOGIN_ID_IMPERSONATION_HEADER,
    );
    expect(sessionStorage.getItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER)).toBeNull();
  });
});
