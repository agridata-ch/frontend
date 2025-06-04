import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginAuthGuard } from './login.guard';
import { AuthService } from '@/shared/services/auth.service';

describe('LoginAuthGuard', () => {
  let guard: LoginAuthGuard;
  let mockAuthService: { isAuthenticated: jest.Mock<boolean, []> };
  let mockRouter: { navigate: jest.Mock<Promise<boolean>, [unknown[]]> };

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    };

    TestBed.configureTestingModule({
      providers: [
        LoginAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });

    guard = TestBed.inject(LoginAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should navigate to "/" and return true when user is authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);

    const result = guard.canActivate();

    expect(result).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should return false and not navigate when user is not authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
