import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  private readonly oidcSecurityService = inject(OidcSecurityService);
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

    return this.oidcSecurityService.getAuthenticationResult().pipe(
      map((authResult) => {
        const accessToken = authResult?.access_token;
        let userRoles: string[] = [];

        if (accessToken) {
          const decoded = this.decodeAccessToken(accessToken);
          // Keycloak realm roles
          if (decoded?.realm_access?.roles) {
            userRoles = userRoles.concat(decoded.realm_access.roles);
          }
        }

        // save user roles in session storage for later use
        localStorage.setItem('userRoles', JSON.stringify(userRoles));

        const hasRole =
          requiredRoles.length === 0 || requiredRoles.some((role) => userRoles.includes(role));
        if (!hasRole) {
          return this.router.parseUrl('/forbidden');
        }
        return true;
      }),
    );
  }
}
