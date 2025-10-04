import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Guard to redirect authenticated users based on their role.
 * Producers go to consent request page.
 * Consumers go to data requests page.
 * Unauthenticated users stay on the landing page.
 *
 * CommentLastReviewed: 2025-08-27
 */
@Injectable({
  providedIn: 'root',
})
export class HomeRedirectGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly stateService = inject(AgridataStateService);

  canActivate() {
    this.authService.checkAuth();
    if (!this.authService.isAuthenticated()) {
      // Allow unauthenticated users to access the landing page
      return true;
    }

    if (this.authService.isProducer() || this.stateService.isImpersonating()) {
      return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    } else if (this.authService.isConsumer()) {
      return this.router.createUrlTree([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH]);
    } else if (this.authService.isSupporter()) {
      return this.router.createUrlTree([ROUTE_PATHS.SUPPORT_PATH]);
    }

    // Default - stay on the landing page
    return true;
  }
}
