import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ROUTE_PATHS } from '@/shared/constants/constants';

import { AuthService } from './auth.service';

/**
 * Implements a route guard that checks authentication and required roles before allowing navigation.
 * Redirects to a forbidden route if access is denied.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private decodeAccessToken(token: string) {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return {};
    }
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRoles: string[] = route.data['roles'] || [];

    return this.oidcSecurityService.checkAuth().pipe(
      map(({ accessToken, isAuthenticated }) => {
        let userRoles: string[] = [];

        if (accessToken) {
          const decoded = this.decodeAccessToken(accessToken);
          // Keycloak realm roles
          if (decoded?.realm_access?.roles) {
            userRoles = userRoles.concat(decoded.realm_access.roles);
          }
        }

        this.authService.isAuthenticated.set(isAuthenticated);
        this.authService.setUserRoles(userRoles);

        if (!requiredRoles || requiredRoles.length === 0) {
          return true; // No specific roles required, allow access
        }

        const hasRole =
          requiredRoles.length === 0 || requiredRoles.some((role) => userRoles.includes(role));
        if (!hasRole) {
          return this.router.parseUrl(ROUTE_PATHS.FORBIDDEN);
        }
        return true;
      }),
    );
  }
}
