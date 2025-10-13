import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';

import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';

import { ImpersonationGuardGuard } from './impersonation.guard';

describe('ImpersonationGuardGuard', () => {
  let guard: ImpersonationGuardGuard;
  let mockActivatedRouteSnapshot: Partial<ActivatedRouteSnapshot>;

  beforeEach(() => {
    // Create mock for ActivatedRouteSnapshot
    mockActivatedRouteSnapshot = {
      queryParamMap: {
        get: jest.fn(),
      },
    } as any;

    TestBed.configureTestingModule({
      providers: [ImpersonationGuardGuard],
    });

    guard = TestBed.inject(ImpersonationGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should set ktidp in sessionStorage when query param is present', () => {
    // Arrange
    const testKtidp = 'test-ktidp-value';
    (mockActivatedRouteSnapshot.queryParamMap?.get as jest.Mock).mockReturnValue(testKtidp);

    // Clear any previous values
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot as ActivatedRouteSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap?.get).toHaveBeenCalledWith(
      KTIDP_IMPERSONATION_QUERY_PARAM,
    );
    expect(sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM)).toBe(testKtidp);
    expect(result).toBe(true);

    // Clean up
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);
  });

  it('should not set ktidp in sessionStorage when query param is not present', () => {
    // Arrange
    (mockActivatedRouteSnapshot.queryParamMap?.get as jest.Mock).mockReturnValue(null);

    // Clear any previous values
    sessionStorage.removeItem(KTIDP_IMPERSONATION_QUERY_PARAM);

    // Act
    const result = guard.canActivate(mockActivatedRouteSnapshot as ActivatedRouteSnapshot);

    // Assert
    expect(mockActivatedRouteSnapshot.queryParamMap?.get).toHaveBeenCalledWith(
      KTIDP_IMPERSONATION_QUERY_PARAM,
    );
    expect(sessionStorage.getItem(KTIDP_IMPERSONATION_QUERY_PARAM)).toBeNull();
    expect(result).toBe(true);
  });
});
