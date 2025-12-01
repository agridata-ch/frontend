import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Guard to redirect authenticated users based on their role.
 * Producers go to consent request page.
 * Consumers go to data requests page.
 * Unauthenticated users stay on the landing page.
 *
 * CommentLastReviewed: 2025-12-01
 */
@Injectable({
  providedIn: 'root',
})
export class HomeRedirectGuard implements CanActivate {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);

  async canActivate(): Promise<boolean | UrlTree> {
    const isAuthenticated = await this.authService.initializeAuth();

    if (!isAuthenticated) {
      return true;
    }

    if (this.authService.isProducer() || this.stateService.isImpersonating()) {
      await this.authService.initializeAuthorizedUids();
      return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    }

    if (this.authService.isConsumer()) {
      return this.router.createUrlTree([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH]);
    }

    if (this.authService.isSupporter()) {
      return this.router.createUrlTree([ROUTE_PATHS.SUPPORT_PATH]);
    }

    return true;
  }
}
