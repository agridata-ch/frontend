import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { AuthorizationGuard } from './auth.guard';
import { OidcSecurityService } from 'angular-auth-oidc-client';

describe('AuthorizationGuard', () => {
  let guard: AuthorizationGuard;
  let mockOidc: { getAuthenticationResult: jest.Mock };
  let mockRouter: { parseUrl: jest.Mock };

  // Helper to create a fake JWT with a given payload
  function createJwt(payload: object): string {
    const encode = (obj: unknown) =>
      btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const header = encode({ alg: 'none', typ: 'JWT' });
    const body = encode(payload);
    return `${header}.${body}.`;
  }

  beforeEach(() => {
    mockOidc = {
      getAuthenticationResult: jest.fn(),
    };
    mockRouter = {
      parseUrl: jest.fn().mockReturnValue({} as UrlTree),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthorizationGuard,
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(AuthorizationGuard);
    sessionStorage.clear();
  });

  it('allows activation when no roles are required', (done) => {
    mockOidc.getAuthenticationResult.mockReturnValue(of({ access_token: null }));
    const routeSnapshot = { data: { roles: [] } } as unknown as ActivatedRouteSnapshot;

    guard.canActivate(routeSnapshot).subscribe((result) => {
      expect(result).toBe(true);
      expect(sessionStorage.getItem('userRoles')).toBe(JSON.stringify([]));
      done();
    });
  });

  it('allows activation if JWT contains a required role', (done) => {
    const jwt = createJwt({ realm_access: { roles: ['admin', 'user'] } });
    mockOidc.getAuthenticationResult.mockReturnValue(of({ access_token: jwt }));
    const routeSnapshot = { data: { roles: ['user'] } } as unknown as ActivatedRouteSnapshot;

    guard.canActivate(routeSnapshot).subscribe((result) => {
      expect(result).toBe(true);
      expect(sessionStorage.getItem('userRoles')).toBe(JSON.stringify(['admin', 'user']));
      done();
    });
  });

  it('denies activation if JWT does not contain a required role', (done) => {
    const jwt = createJwt({ realm_access: { roles: ['viewer'] } });
    mockOidc.getAuthenticationResult.mockReturnValue(of({ access_token: jwt }));
    const routeSnapshot = {
      data: { roles: ['editor', 'admin'] },
    } as unknown as ActivatedRouteSnapshot;

    const fakeTree = {} as UrlTree;
    mockRouter.parseUrl.mockReturnValue(fakeTree);

    guard.canActivate(routeSnapshot).subscribe((result) => {
      expect(result).toBe(fakeTree);
      expect(sessionStorage.getItem('userRoles')).toBe(JSON.stringify(['viewer']));
      expect(mockRouter.parseUrl).toHaveBeenCalledWith('/forbidden');
      done();
    });
  });

  it('denies activation when access_token is missing and roles required', (done) => {
    mockOidc.getAuthenticationResult.mockReturnValue(of({}));
    const routeSnapshot = { data: { roles: ['anyrole'] } } as unknown as ActivatedRouteSnapshot;

    const fakeTree = {} as UrlTree;
    mockRouter.parseUrl.mockReturnValue(fakeTree);

    guard.canActivate(routeSnapshot).subscribe((result) => {
      expect(result).toBe(fakeTree);
      expect(sessionStorage.getItem('userRoles')).toBe(JSON.stringify([]));
      done();
    });
  });

  it('handles malformed JWT gracefully', (done) => {
    const badJwt = 'invalid.token.string';
    mockOidc.getAuthenticationResult.mockReturnValue(of({ access_token: badJwt }));
    const routeSnapshot = { data: { roles: [] } } as unknown as ActivatedRouteSnapshot;

    guard.canActivate(routeSnapshot).subscribe((result) => {
      expect(result).toBe(true);
      expect(sessionStorage.getItem('userRoles')).toBe(JSON.stringify([]));
      done();
    });
  });
});
