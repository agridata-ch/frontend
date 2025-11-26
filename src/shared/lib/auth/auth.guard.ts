import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';

import { AuthService } from './auth.service';

/**
 * Implements a route guard that checks authentication and required roles before allowing navigation.
 * Redirects to a forbidden route if access is denied.
 * Ensures that user preferences are fetched upon successful authorization.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class AuthorizationGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const requiredRoles: string[] = route.data['roles'] || [];
    return this.authService.initializeUserInfo().pipe(
      map(() => {
        if (!requiredRoles || requiredRoles.length === 0) {
          return true;
        }
        const hasRole =
          requiredRoles.length === 0 ||
          requiredRoles.some((role) => this.authService.userRoles().includes(role));
        if (!hasRole) {
          return this.router.parseUrl(ROUTE_PATHS.FORBIDDEN);
        }
        return true;
      }),
      catchError((error) => {
        if (route.url.toString().includes(ROUTE_PATHS.ERROR)) {
          return of(true);
        }
        this.errorService.handleError(error);
        return of(this.router.parseUrl(ROUTE_PATHS.ERROR));
      }),
    );
  }
}
