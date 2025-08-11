import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

import { AuthService, UserData } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockOidc: {
    checkAuth: jest.Mock;
    authorize: jest.Mock<void, []>;
    logoff: jest.Mock;
  };
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };
  let setItemSpy: jest.SpyInstance;
  let removeItemSpy: jest.SpyInstance;

  const fakeUserData: UserData = {
    sub: '123',
    name: 'Alice',
    preferred_username: 'alice123',
    email: 'alice@example.com',
    family_name: 'Smith',
    given_name: 'Alice',
    uid: 123,
    loginid: 'alice123',
  };

  /**
   * Helper to build a minimal JWT‐style string whose payload
   * contains realm_access.roles.
   */
  function makeJwtWithRoles(roles: string[]): string {
    const payload = { realm_access: { roles } };
    const json = JSON.stringify(payload);
    const base64 = btoa(json);
    return `header.${base64}.signature`;
  }

  beforeEach(() => {
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockClear();
    removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockClear();

    mockOidc = {
      checkAuth: jest.fn(),
      authorize: jest.fn(),
      logoff: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.clear();
  });

  it('should set signals and localStorage when checkAuth emits authenticated=true', (done) => {
    const roles = ['role1', 'role2'];
    const accessToken = makeJwtWithRoles(roles);
    const userData = { ...fakeUserData, uid: 'CHE123' }; // Simulate the raw UID from the auth response
    mockOidc.checkAuth.mockReturnValue(of({ isAuthenticated: true, userData, accessToken }));

    service = TestBed.inject(AuthService);

    setTimeout(() => {
      expect(service.isAuthenticated()).toBe(true);
      expect(service.userData()).toEqual(fakeUserData);
      expect(service.userRoles()).toEqual(roles);

      // We need to check that localStorage is called with the raw userData
      const rawUserData = { ...fakeUserData, uid: 'CHE123' };
      expect(setItemSpy).toHaveBeenCalledWith('oidc.user', JSON.stringify(rawUserData));
      expect(removeItemSpy).not.toHaveBeenCalled();

      done();
    }, 0);
  });

  it('should clear userData and localStorage when checkAuth emits authenticated=false', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );

    localStorage.setItem('oidc.user', JSON.stringify({ dummy: 'value' }));

    service = TestBed.inject(AuthService);

    setTimeout(() => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.userData()).toBeNull();
      expect(service.userRoles()).toBeNull();

      expect(removeItemSpy).toHaveBeenCalledWith('oidc.user');
      done();
    }, 0);
  });

  it('login() calls oidc.authorize()', () => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );
    service = TestBed.inject(AuthService);

    service.login();

    expect(mockOidc.authorize).toHaveBeenCalled();
  });

  it('logout() calls oidc.logoff() and then router.navigate("/")', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );
    mockOidc.logoff.mockReturnValue(of(null));
    service = TestBed.inject(AuthService);

    service.logout();

    setTimeout(() => {
      expect(mockOidc.logoff).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 0);
  });

  it('calling checkAuth(false) does not modify localStorage when unauthenticated', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );
    service = TestBed.inject(AuthService);

    setTimeout(() => {
      expect(removeItemSpy).toHaveBeenCalledWith('oidc.user');
      removeItemSpy.mockClear();
      setItemSpy.mockClear();

      const roles = ['admin'];
      const token = makeJwtWithRoles(roles);
      const userData = { ...fakeUserData, uid: 'CHE123' }; // Simulate the raw UID from the auth response
      mockOidc.checkAuth.mockReturnValue(
        of({ isAuthenticated: true, userData, accessToken: token }),
      );

      service.checkAuth(false);

      setTimeout(() => {
        expect(service.isAuthenticated()).toBe(true);
        expect(service.userData()).toEqual(fakeUserData);
        expect(service.userRoles()).toEqual(roles);

        expect(setItemSpy).not.toHaveBeenCalled();
        expect(removeItemSpy).not.toHaveBeenCalled();
        done();
      }, 0);
    }, 0);
  });
});
