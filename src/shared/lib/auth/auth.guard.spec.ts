import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom, of } from 'rxjs';

import { ROUTE_PATHS } from '@/shared/constants/constants';
import { MockAuthService } from '@/shared/testing/mocks';

import { AuthorizationGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let mockOidc: Partial<OidcSecurityService>;
  let mockRouter: Partial<Router>;
  let fakeUrlTree: UrlTree;

  /**
   * Helper to build a minimal JWT‐style string whose payload
   * is base64(JSON.stringify(payloadObj)). The guard’s decodeAccessToken splits on '.'
   * and does atob(...) → JSON.parse(...).
   */
  function makeJwt(payloadObj: object): string {
    const json = JSON.stringify(payloadObj);
    const base64 = btoa(json);
    return `header.${base64}.signature`;
  }

  beforeEach(() => {
    // Create a dummy UrlTree; we only check identity in our expectations.
    fakeUrlTree = new UrlTree();

    mockRouter = {
      parseUrl: jest.fn().mockReturnValue(fakeUrlTree),
    };

    // By default, checkAuth() emits an empty object with no access_token
    mockOidc = {
      checkAuth: jest.fn().mockReturnValue(of({ accessToken: '', isAuthenticated: false })),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthorizationGuard,
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useClass: MockAuthService },
      ],
    });

    guard = TestBed.inject(AuthorizationGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows activation when no roles are required (route.data.roles undefined)', async () => {
    // Cast via unknown to satisfy TS that not all properties are present
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    // Simulate auth result with no accessToken
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: '', isAuthenticated: false }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    // Verify the mock was called correctly
    const authService = TestBed.inject(AuthService);
    expect(authService.setUserRoles).toHaveBeenCalledWith([]);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('allows activation when required role is present in token', async () => {
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;

    // Create a JWT whose payload has realm_access.roles = ['admin','user']
    const payload = { realm_access: { roles: ['admin', 'user'] } };
    const token = makeJwt(payload);
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: token, isAuthenticated: true }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(TestBed.inject(AuthService).setUserRoles).toHaveBeenCalledWith(['admin', 'user']);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('denies activation (UrlTree) when required role is missing', async () => {
    const route = { data: { roles: ['manager'] } } as unknown as ActivatedRouteSnapshot;

    // Token payload has roles ['admin','user'], but route needs ['manager']
    const payload = { realm_access: { roles: ['admin', 'user'] } };
    const token = makeJwt(payload);
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: token, isAuthenticated: true }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(fakeUrlTree);
    expect(TestBed.inject(AuthService).setUserRoles).toHaveBeenCalledWith(['admin', 'user']);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('treats malformed token as having no roles (forbidden if roles required)', async () => {
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;

    // Malformed JWT (decodeAccessToken will catch and return empty object)
    const badToken = 'not-a.valid.token';
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: badToken, isAuthenticated: true }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(fakeUrlTree);
    expect(TestBed.inject(AuthService).setUserRoles).toHaveBeenCalledWith([]);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('allows activation if malformed token but no roles required', async () => {
    const route = { data: { roles: [] } } as unknown as ActivatedRouteSnapshot;

    // Malformed JWT, but since no roles are required, guard returns true
    const badToken = 'abc.def.ghi';
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: badToken, isAuthenticated: true }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(TestBed.inject(AuthService).setUserRoles).toHaveBeenCalledWith([]);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('treats missing access_token as no roles (forbidden if roles required)', async () => {
    const route = { data: { roles: ['user'] } } as unknown as ActivatedRouteSnapshot;

    // auth result has no accessToken
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: '', isAuthenticated: true }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(fakeUrlTree);
    expect(TestBed.inject(AuthService).setUserRoles).toHaveBeenCalledWith([]);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('allows activation if missing access_token but no roles required', async () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    // auth result with no accessToken but no roles required
    (mockOidc.checkAuth as jest.Mock).mockReturnValue(
      of({ accessToken: '', isAuthenticated: true }),
    );

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(TestBed.inject(AuthService).setUserRoles).toHaveBeenCalledWith([]);
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });
});
