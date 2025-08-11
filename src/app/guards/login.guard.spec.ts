import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';

import { LoginAuthGuard } from './login.guard';

describe('LoginAuthGuard', () => {
  let guard: LoginAuthGuard;
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };
  let authService: AuthService;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        LoginAuthGuard,
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(LoginAuthGuard);
    authService = TestBed.inject(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to "/" and return true when user is authenticated', () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return false and not navigate when user is not authenticated', () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
