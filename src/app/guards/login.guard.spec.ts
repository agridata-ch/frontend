import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { LoginAuthGuard } from './login.guard';

describe('LoginAuthGuard', () => {
  let guard: LoginAuthGuard;
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };
  let authService: MockAuthService;

  beforeEach(() => {
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    authService = createMockAuthService();

    TestBed.configureTestingModule({
      providers: [
        LoginAuthGuard,
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(LoginAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to "/" and return true when user is authenticated', () => {
    authService.isAuthenticated.set(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return false and not navigate when user is not authenticated', () => {
    authService.isAuthenticated.set(false);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
