import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { LoginResponse, OidcSecurityService } from 'angular-auth-oidc-client';
import { catchError, of } from 'rxjs';

import { UidDto, UserInfoDto, UsersService } from '@/entities/openapi';
import { USER_ROLES } from '@/shared/constants/constants';
import { createMockUserService, MockUserService } from '@/shared/testing/mocks';
import { mockUserInfo } from '@/shared/testing/mocks/mock-auth-service';

import { AuthService } from './auth.service';
/**
 * Helper to build a minimal JWT‐style string whose payload
 * contains realm_access.roles.
 */
// We'll use this helper in the JWT test
function createJwtWithRoles(roles: string[]): string {
  const payload = { realm_access: { roles } };
  const json = JSON.stringify(payload);
  const base64 = btoa(json);
  return `header.${base64}.signature`;
}

function createLoginResponse(isAuthenticated: boolean, roles: string[]): LoginResponse {
  return {
    isAuthenticated,
    accessToken: createJwtWithRoles(roles),
    userData: {},
    idToken: '',
  };
}

const uid = '081';

describe('AuthService', () => {
  let authService: AuthService;
  let mockOidc: {
    checkAuth: jest.Mock;
    authorize: jest.Mock<void, []>;
    logoff: jest.Mock;
  };
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };
  let userService: MockUserService;

  beforeEach(() => {
    userService = createMockUserService();
    userService.getUserInfo.mockReturnValue(of(mockUserInfo));
    userService.getAuthorizedUids.mockReturnValue(of([{ uid: uid } as UidDto]));

    mockRouter = { navigate: jest.fn() };
    mockOidc = {
      checkAuth: jest.fn(),
      authorize: jest.fn(),
      logoff: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: UsersService, useValue: userService },
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
      ],
    });
    authService = TestBed.inject(AuthService);
  });

  it('should extract roles from JWT token', () => {
    const testRoles = ['admin', 'user'];

    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, testRoles)));

    authService.initializeAuth().subscribe();
    // Manually set the roles that would be extracted from the JWT

    expect(authService.userRoles()).toEqual(testRoles);
  });

  it('should have no role if none is present in request', () => {
    // Test for the isProducer, isConsumer, and isSupporter computed signals
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    authService.initializeAuth().subscribe();

    // First, test with no roles (empty array instead of null)
    expect(authService.isProducer()).toBe(false);
    expect(authService.isConsumer()).toBe(false);
    expect(authService.isSupporter()).toBe(false);
  });

  it('should be producer if having producer role', () => {
    mockOidc.checkAuth.mockReturnValue(
      of(createLoginResponse(true, [USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER])),
    );
    authService.initializeAuth().subscribe();
    expect(authService.isProducer()).toBe(true);
    expect(authService.isConsumer()).toBe(false);
    expect(authService.isSupporter()).toBe(false);
  });

  it('should be consumer if having consumer role', () => {
    mockOidc.checkAuth.mockReturnValue(
      of(createLoginResponse(true, [USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER])),
    );
    authService.initializeAuth().subscribe();
    expect(authService.isProducer()).toBe(false);
    expect(authService.isConsumer()).toBe(true);
    expect(authService.isSupporter()).toBe(false);
  });

  it('should be supporter if having supporter role', () => {
    mockOidc.checkAuth.mockReturnValue(
      of(createLoginResponse(true, [USER_ROLES.AGRIDATA_SUPPORTER])),
    );
    authService.initializeAuth().subscribe();
    expect(authService.isProducer()).toBe(false);
    expect(authService.isConsumer()).toBe(false);
    expect(authService.isSupporter()).toBe(true);
  });

  it('should set user info if checkAuth emits authenticated=true', (done) => {
    const roles = ['role1', 'role2'];

    authService = TestBed.inject(AuthService);
    userService.getUserInfo.mockReturnValue(of(mockUserInfo));
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, roles)));
    authService.initializeUserInfo().subscribe((result) => {
      expect(result).toBeTruthy();
      expect(authService.isAuthenticated()).toBe(true);
      expect(authService.userInfo()).toEqual(mockUserInfo);
      expect(authService.userRoles()).toEqual(roles);
      done();
    });
  });

  it('should clear userData when checkAuth emits authenticated=false', (done) => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    authService.initializeAuth().subscribe();
    expect(authService.isAuthenticated()).toBe(true);

    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(false, [])));
    authService.initializeAuth().subscribe((result) => {
      expect(result).toBeFalsy();
      expect(authService.isAuthenticated()).toBe(false);
      expect(authService.userInfo()).toBeFalsy();
      expect(authService.userRoles().length).toBe(0);
      done();
    });
  });

  it('login() calls oidc.authorize()', () => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );

    authService.login();

    expect(mockOidc.authorize).toHaveBeenCalled();
  });

  it('logout() calls oidc.logoff() and then router.navigate("/")', () => {
    mockOidc.checkAuth.mockReturnValue(
      of({ isAuthenticated: false, userData: null, accessToken: '' }),
    );
    mockOidc.logoff.mockReturnValue(of(null));
    authService = TestBed.inject(AuthService);

    authService.logout();

    TestBed.tick();

    expect(mockOidc.logoff).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return userFullName', () => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));

    authService.initializeUserInfo().subscribe();

    expect(authService.getUserFullName()).toBe('Producer 081');
  });

  it('should return userEmail', () => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    userService.getUserInfo.mockReturnValue(of(mockUserInfo));
    authService.initializeUserInfo().subscribe();

    const email = authService.getUserEmail();

    expect(email).toBe('producer-081@agridata.ch');
  });

  it('should throw error user is not a producer', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of(createLoginResponse(true, [USER_ROLES.AGRIDATA_DATA_REQUESTS_CONSUMER])),
    );
    authService
      .initializeAuthorizedUids()
      .pipe(
        catchError((err) => {
          expect(err).toBeInstanceOf(Error);
          done();
          return of('errorHandled');
        }),
      )
      .subscribe((result) => {
        expect(result).toEqual('errorHandled');
        if (result !== 'errorHandled') {
          done();
        }
      });
  });

  it('should accept request if the user is supporter', (done) => {
    mockOidc.checkAuth.mockReturnValue(
      of(createLoginResponse(true, [USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER])),
    );

    authService.initializeAuthorizedUids().subscribe((result) => {
      expect(result).toBeTruthy();
      expect(result.length).toBe(1);
      expect(result[0].uid).toBe(uid);
      done();
    });
  });
});

describe('AuthService User Properties', () => {
  let authService: AuthService;
  let mockOidc: {
    checkAuth: jest.Mock;
    authorize: jest.Mock<void, []>;
    logoff: jest.Mock;
  };
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };
  let userService: MockUserService;

  beforeEach(() => {
    userService = createMockUserService();
    userService.getAuthorizedUids.mockReturnValue(of([{ uid: uid } as UidDto]));
    mockRouter = { navigate: jest.fn() };
    mockOidc = {
      checkAuth: jest.fn(),
      authorize: jest.fn(),
      logoff: jest.fn(),
    };
  });

  function createTestModule(userInfo: UserInfoDto) {
    userService.getUserInfo.mockReturnValue(of(userInfo));
    TestBed.configureTestingModule({
      providers: [
        { provide: UsersService, useValue: userService },
        { provide: OidcSecurityService, useValue: mockOidc },
        { provide: Router, useValue: mockRouter },
      ],
    });
    authService = TestBed.inject(AuthService);
  }

  it('should return userEmail without email', () => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    createTestModule({ ...mockUserInfo, email: undefined });

    authService.initializeUserInfo().subscribe();
    const email = authService.getUserEmail();

    expect(email).toBe('');
  });

  it('should return userFullName without givenName', () => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    createTestModule({ ...mockUserInfo, givenName: undefined });

    authService.initializeUserInfo().subscribe();

    const fullName = authService.getUserFullName();

    expect(fullName).toBe('081');
  });

  it('should return userFullName without familyName', () => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    createTestModule({ ...mockUserInfo, familyName: undefined });

    authService.initializeUserInfo().subscribe();
    const fullName = authService.getUserFullName();

    expect(fullName).toBe('Producer');
  });

  it('should return userFullName without userData', () => {
    mockOidc.checkAuth.mockReturnValue(of(createLoginResponse(true, [])));
    createTestModule({});

    authService.initializeUserInfo().subscribe();
    const fullName = authService.getUserFullName();

    expect(fullName).toBe('');
  });
});
