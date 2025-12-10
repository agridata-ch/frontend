import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Controls access to login routes. It prevents authenticated users from re-entering the login page
 * and redirects them to the home page.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class LoginAuthGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  async canActivate() {
    const authenticated = await this.authService.initializeAuth();
    return authenticated
      ? this.router.createUrlTree(['/'])
      : this.router.createUrlTree([ROUTE_PATHS.FORBIDDEN]);
  }
}
