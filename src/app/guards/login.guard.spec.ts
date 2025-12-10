import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

import { LoginAuthGuard } from './login.guard';

describe('LoginAuthGuard', () => {
  let guard: LoginAuthGuard;
  let authService: MockAuthService;
  let mockRouter: {
    createUrlTree: jest.Mock;
  };
  const mockUrlTree = 'some url';

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
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

  it('should navigate to "/" and return true when user is authenticated', async () => {
    authService.initializeAuth.mockResolvedValue(true);

    const result = await guard.canActivate();

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
  });

  it('should return false and not navigate when user is not authenticated', async () => {
    authService.initializeAuth.mockResolvedValue(false);

    const result = await guard.canActivate();

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.FORBIDDEN]);
  });
});
