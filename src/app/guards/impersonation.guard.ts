import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';

import { KTIDP_IMPERSONATION_QUERY_PARAM } from '@/shared/constants/constants';

/**
 * Guard to set the impersonated ktidp in stateservice if present in the route.
 *
 * CommentLastReviewed: 2025-10-01
 */
@Injectable({
  providedIn: 'root',
})
export class ImpersonationGuard implements CanActivate {
  canActivate(route: ActivatedRouteSnapshot) {
    const ktidp = route.queryParamMap.get(KTIDP_IMPERSONATION_QUERY_PARAM);
    if (ktidp) {
      sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, ktidp);
    }
    return true;
  }
}
