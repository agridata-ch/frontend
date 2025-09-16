import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { of } from 'rxjs';

import { UsersService } from '@/entities/openapi';
import { mockUserData } from '@/shared/testing/mocks/mock-auth.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let mockAuthService: AuthService;
  let mockOidc: {
    checkAuth: jest.Mock;
    authorize: jest.Mock<void, []>;
    logoff: jest.Mock;
  };
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };
  let mockUsersService: Partial<UsersService>;
  let setItemSpy: jest.SpyInstance;
  let removeItemSpy: jest.SpyInstance;

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
    mockUsersService = {
      getUserInfo: jest.fn().mockReturnValue(of(mockUserData)),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
        { provide: UsersService, useValue: mockUsersService },
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
    mockOidc.checkAuth.mockReturnValue(of({ isAuthenticated: true, accessToken }));
    mockAuthService = TestBed.inject(AuthService);

    setTimeout(() => {
      expect(mockAuthService.isAuthenticated()).toBe(true);
      expect(mockAuthService.userData()).toEqual(mockUserData);
      expect(mockAuthService.userRoles()).toEqual(roles);

      expect(setItemSpy).toHaveBeenCalledWith('oidc.user', JSON.stringify(mockUserData));
      expect(removeItemSpy).not.toHaveBeenCalled();

      done();
    }, 0);
  });

  it('should clear userData and localStorage when checkAuth emits authenticated=false', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );

    localStorage.setItem('oidc.user', JSON.stringify({ dummy: 'value' }));

    mockAuthService = TestBed.inject(AuthService);

    setTimeout(() => {
      expect(mockAuthService.isAuthenticated()).toBe(false);
      expect(mockAuthService.userData()).toBeNull();
      expect(mockAuthService.userRoles()).toBeNull();

      expect(removeItemSpy).toHaveBeenCalledWith('oidc.user');
      done();
    }, 0);
  });

  it('login() calls oidc.authorize()', () => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );
    mockAuthService = TestBed.inject(AuthService);

    mockAuthService.login();

    expect(mockOidc.authorize).toHaveBeenCalled();
  });

  it('logout() calls oidc.logoff() and then router.navigate("/")', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );
    mockOidc.logoff.mockReturnValue(of(null));
    mockAuthService = TestBed.inject(AuthService);

    mockAuthService.logout();

    setTimeout(() => {
      expect(mockOidc.logoff).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      done();
    }, 0);
  });

  it('calling checkAuth(false) does not modify localStorage when unauthenticated', (done) => {
    mockOidc.checkAuth.mockReturnValue(of({ isAuthenticated: false, accessToken: '' }));
    mockAuthService = TestBed.inject(AuthService);

    setTimeout(() => {
      expect(removeItemSpy).toHaveBeenCalledWith('oidc.user');
      removeItemSpy.mockClear();
      setItemSpy.mockClear();

      const roles = ['admin'];
      const token = makeJwtWithRoles(roles);
      mockOidc.checkAuth.mockReturnValue(of({ isAuthenticated: true, accessToken: token }));

      mockAuthService.checkAuth(false);

      setTimeout(() => {
        expect(mockAuthService.isAuthenticated()).toBe(true);
        expect(mockAuthService.userData()).toEqual(mockUserData);
        expect(mockAuthService.userRoles()).toEqual(roles);

        expect(setItemSpy).not.toHaveBeenCalled();
        expect(removeItemSpy).not.toHaveBeenCalled();
        done();
      }, 0);
    }, 0);
  });

  it('should return userFullName', () => {
    mockAuthService.userData.set(mockUserData);

    const fullName = mockAuthService.getUserFullName();

    expect(fullName).toBe('Producer 081');
  });

  it('should return userFullName without givenName', () => {
    mockAuthService.userData.set({ ...mockUserData, givenName: undefined });

    const fullName = mockAuthService.getUserFullName();

    expect(fullName).toBe(' 081');
  });

  it('should return userFullName without familyName', () => {
    mockAuthService.userData.set({ ...mockUserData, familyName: undefined });

    const fullName = mockAuthService.getUserFullName();

    expect(fullName).toBe('Producer ');
  });

  it('should return userFullName without userData', () => {
    mockAuthService.userData.set(null);
    const fullName = mockAuthService.getUserFullName();

    expect(fullName).toBe('');
  });

  it('should return userEmail', () => {
    mockAuthService.userData.set(mockUserData);

    const email = mockAuthService.getUserEmail();

    expect(email).toBe('producer-081@agridata.ch');
  });

  it('should return userEmail without email', () => {
    mockAuthService.userData.set({ ...mockUserData, email: undefined });

    const email = mockAuthService.getUserEmail();

    expect(email).toBe('');
  });

  it('should return userEmail without userData', () => {
    mockAuthService.userData.set(null);

    const email = mockAuthService.getUserEmail();

    expect(email).toBe('');
  });
});
