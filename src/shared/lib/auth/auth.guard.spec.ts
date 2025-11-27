import { WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { firstValueFrom, of, throwError } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { KTIDP_IMPERSONATION_QUERY_PARAM, ROUTE_PATHS } from '@/shared/constants/constants';
import {
  createMockAuthService,
  MockAuthService,
  mockUserInfo,
} from '@/shared/testing/mocks/mock-auth-service';
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
    authService.initializeUserInfo.mockReturnValue(of(mockUserInfo));

    const result = await firstValueFrom(guard.canActivate(mockActivatedRouteSnapshot));

    expect(result).toBe(true);
  });

  it('denies activation when required role is missing and redirects to forbidden', async () => {
    authService.initializeUserInfo.mockReturnValue(of(undefined));
    (authService.__testSignals.userRoles as WritableSignal<string[]>).set(['ROLE_USER']);
    mockActivatedRouteSnapshot.data = { roles: ['ROLE_ADMIN'] };

    const result = await firstValueFrom(guard.canActivate(mockActivatedRouteSnapshot));

    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('allows activation when user has one of the required roles', async () => {
    authService.initializeUserInfo.mockReturnValue(of(undefined));
    authService.__testSignals.userRoles.set(['ROLE_ADMIN', 'ROLE_USER']);

    mockActivatedRouteSnapshot.data = { roles: ['ROLE_ADMIN'] };

    const result = await firstValueFrom(guard.canActivate(mockActivatedRouteSnapshot));

    expect(result).toBe(true);
  });

  it('handles errors from initializeAuth by sending them to errorService and redirecting to error route', async () => {
    const testError = new Error('Test initializeAuth error');
    authService.initializeUserInfo.mockReturnValue(throwError(() => testError));

    const result = await firstValueFrom(guard.canActivate(mockActivatedRouteSnapshot));

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
    expect(result).toBe(fakeUrlTree);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
  });

  it('ignores errors when on error page and returns true', async () => {
    const testError = new Error('Test initializeAuth error');
    authService.initializeUserInfo.mockReturnValue(throwError(() => testError));
    (mockActivatedRouteSnapshot as any).url = [ROUTE_PATHS.ERROR];

    const result = await firstValueFrom(guard.canActivate(mockActivatedRouteSnapshot));

    expect(errorService.handleError).toHaveBeenCalledTimes(0);
    expect(result).toBe(true);
    expect(mockRouter.parseUrl).toHaveBeenCalledTimes(0);
  });

  it('should set ktidp in sessionStorage when query param is present', () => {
    // Arrange
    const testKtidp = 'test-ktidp-value';
    (mockActivatedRouteSnapshot.queryParamMap?.get as jest.Mock).mockReturnValue(testKtidp);
    authService.initializeUserInfo.mockReturnValue(of(undefined));
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);

    // Act
    guard.canActivate(mockActivatedRouteSnapshot as ActivatedRouteSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap?.get).toHaveBeenCalledWith(
      KTIDP_IMPERSONATION_QUERY_PARAM,
    );
    expect(sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM)).toBe(testKtidp);

    // Clean up
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);
  });

  it('should not set ktidp in sessionStorage when query param is not present', () => {
    // Arrange

    authService.initializeUserInfo.mockReturnValue(of(undefined));

    // Clear any previous values
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);

    // Act
    guard.canActivate(mockActivatedRouteSnapshot as ActivatedRouteSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap?.get).toHaveBeenCalledWith(
      KTIDP_IMPERSONATION_QUERY_PARAM,
    );
    expect(sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM)).toBeNull();
  });
});
