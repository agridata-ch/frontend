import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { firstValueFrom, of } from 'rxjs';

import { ROUTE_PATHS } from '@/shared/constants/constants';

import { AuthorizationGuard } from './auth.guard';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let mockOidc: Partial<OidcSecurityService>;
  let mockRouter: Partial<Router>;
  let fakeUrlTree: UrlTree;
  let setItemSpy: jest.SpyInstance;

  /**
   * We only care about access_token here. Any other properties on the auth result
   * are irrelevant for this guard.
   */
  interface AuthResult {
    access_token?: string;
  }

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
    // Spy on localStorage.setItem via Storage.prototype
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    setItemSpy.mockClear();

    // Create a dummy UrlTree; we only check identity in our expectations.
    fakeUrlTree = new UrlTree();

    mockRouter = {
      parseUrl: jest.fn().mockReturnValue(fakeUrlTree),
    };

    // By default, getAuthenticationResult() emits an empty object ⇒ no access_token
    mockOidc = {
      getAuthenticationResult: jest.fn().mockReturnValue(of({} as AuthResult)),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthorizationGuard,
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(AuthorizationGuard);
  });

  afterEach(() => {
    setItemSpy.mockRestore();
    jest.restoreAllMocks();
  });

  it('allows activation when no roles are required (route.data.roles undefined)', async () => {
    // Cast via unknown to satisfy TS that not all properties are present
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    // Simulate auth result with no access_token
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of({} as AuthResult));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify([]));
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('allows activation when required role is present in token', async () => {
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;

    // Create a JWT whose payload has realm_access.roles = ['admin','user']
    const payload = { realm_access: { roles: ['admin', 'user'] } };
    const token = makeJwt(payload);
    const fakeAuth: AuthResult = { access_token: token };
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of(fakeAuth));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify(['admin', 'user']));
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('denies activation (UrlTree) when required role is missing', async () => {
    const route = { data: { roles: ['manager'] } } as unknown as ActivatedRouteSnapshot;

    // Token payload has roles ['admin','user'], but route needs ['manager']
    const payload = { realm_access: { roles: ['admin', 'user'] } };
    const token = makeJwt(payload);
    const fakeAuth: AuthResult = { access_token: token };
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of(fakeAuth));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(fakeUrlTree);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify(['admin', 'user']));
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('treats malformed token as having no roles (forbidden if roles required)', async () => {
    const route = { data: { roles: ['admin'] } } as unknown as ActivatedRouteSnapshot;

    // Malformed JWT (decodeAccessToken will catch and return empty object)
    const badToken = 'not-a.valid.token';
    const fakeAuth: AuthResult = { access_token: badToken };
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of(fakeAuth));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(fakeUrlTree);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify([]));
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('allows activation if malformed token but no roles required', async () => {
    const route = { data: { roles: [] } } as unknown as ActivatedRouteSnapshot;

    // Malformed JWT, but since no roles are required, guard returns true
    const badToken = 'abc.def.ghi';
    const fakeAuth: AuthResult = { access_token: badToken };
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of(fakeAuth));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify([]));
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });

  it('treats missing access_token as no roles (forbidden if roles required)', async () => {
    const route = { data: { roles: ['user'] } } as unknown as ActivatedRouteSnapshot;

    // auth result has no access_token field
    const fakeAuth: AuthResult = {};
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of(fakeAuth));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(fakeUrlTree);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify([]));
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.FORBIDDEN);
  });

  it('allows activation if missing access_token but no roles required', async () => {
    const route = { data: {} } as unknown as ActivatedRouteSnapshot;

    // auth result empty
    const fakeAuth: AuthResult = {};
    (mockOidc.getAuthenticationResult as jest.Mock).mockReturnValue(of(fakeAuth));

    const result = await firstValueFrom(guard.canActivate(route));

    expect(result).toBe(true);
    expect(setItemSpy).toHaveBeenCalledWith('userRoles', JSON.stringify([]));
    expect(mockRouter.parseUrl).not.toHaveBeenCalled();
  });
});
