import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ParticipantService } from '@/entities/api/participant.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Guard to load the producers authorized uids and set the consent request uid parameter if not present or set active uid if parameter is provided.
 *
 * CommentLastReviewed: 2025-08-25
 *
 * @param route
 */
@Injectable({
  providedIn: 'root',
})
export class ProducerUidGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly participantService = inject(ParticipantService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authorizationService = inject(AuthService);

  async canActivate(route: ActivatedRouteSnapshot): Promise<UrlTree | boolean> {
    if (!this.authorizationService.isProducer()) {
      // this filter is only relevant for producers
      return true;
    }
    const userUid = route.paramMap.get('uid') ?? '';

    try {
      const uidDtos = this.agridataStateService.userUidsLoaded()
        ? this.agridataStateService.userUids()
        : await this.participantService.getAuthorizedUids();
      const uids = uidDtos.map((uid) => uid.uid);
      this.agridataStateService.setUids(uidDtos);

      // Always ensure userUid is set when available and valid, regardless of route
      if (userUid) {
        if (!uids.includes(userUid)) {
          return this.fail('invalid url, user does not have access to uid: ' + userUid);
        }

        // Always set active uid when it's different from current
        if (userUid !== this.agridataStateService.activeUid()) {
          this.agridataStateService.setActiveUid(userUid);
        }

        // as of now we don't check if the user is allowed to access the consent request because uid check is expensive.
        return true;
      }

      // If not in CONSENT_REQUEST_PRODUCER_PATH, we don't need to redirect
      if (route?.parent?.url.at(0)?.path !== ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH) {
        return true;
      }
      const defaultUid = this.agridataStateService.getDefaultUid(uidDtos);
      if (defaultUid) {
        this.agridataStateService.setActiveUid(defaultUid);
        if (route.url[0]?.path === ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_CREATE_SUBPATH) {
          // if new consent request is created, the createConsentRequestGuard will handle the redirect
          return true;
        }
        return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, defaultUid]);
      }
    } catch (err) {
      console.error(err);
    }
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }

  private fail(msg: string) {
    console.error('[ProducerUidGuard]', msg);
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }
}
