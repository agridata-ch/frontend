import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AGATE_LOGIN_ID_IMPERSONATION_HEADER, ROUTE_PATHS } from '@/shared/constants/constants';

import { AuthService } from './auth.service';

/**
 * Implements a route guard that checks authentication and required roles before allowing navigation.
 * Redirects to a forbidden route if access is denied.
 * Ensures that user preferences are fetched upon successful authorization.
 *
 * CommentLastReviewed: 2025-12-01
 */
@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {
    const agateLoginId = route.queryParamMap.get(AGATE_LOGIN_ID_IMPERSONATION_HEADER);
    if (agateLoginId) {
      sessionStorage.setItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER, agateLoginId);
    }

    try {
      await this.authService.initializeUserInfo();

      const requiredRoles: string[] = route.data['roles'] || [];
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      const hasRole = requiredRoles.some((role) => this.authService.userRoles().includes(role));
      if (!hasRole) {
        return this.router.parseUrl(ROUTE_PATHS.FORBIDDEN);
      }

      return true;
    } catch (error) {
      if (route.url.toString().includes(ROUTE_PATHS.ERROR)) {
        return true;
      }

      this.errorService.handleError(error as Error);
      return this.router.parseUrl(ROUTE_PATHS.ERROR);
    }
  }
}
