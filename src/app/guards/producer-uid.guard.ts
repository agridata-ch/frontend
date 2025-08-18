import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ParticipantService } from '@/entities/api/participant.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Guard to load the producers authorized uids and set the consent request uid parameter if not present or set active uid if parameter is provided.
 * @param route
 */
@Injectable({
  providedIn: 'root',
})
export class ProducerUidGuard implements CanActivate {
  router = inject(Router);
  participantService = inject(ParticipantService);
  agridataStateService = inject(AgridataStateService);
  authorizationService = inject(AuthService);

  async canActivate(route: ActivatedRouteSnapshot) {
    const fail = (msg: string) => {
      console.error('[consentRequestGuard]', msg);
      return this.router.parseUrl(ROUTE_PATHS.ERROR);
    };

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
      if (route?.parent?.url.at(0)?.path !== ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH) {
        return true;
      }
      if (userUid) {
        if (!uids.includes(userUid)) {
          return fail('invalid url, user does not have access to uid: ' + userUid);
        }
        if (userUid != this.agridataStateService.activeUid()) {
          this.agridataStateService.setActiveUid(userUid);
        }
        // as of now we don't check if the user is allowed to access the consent request because uid check is expensive.
        return true;
      }
      const defaultUid = this.agridataStateService.getDefaultUid(uidDtos);
      if (defaultUid) {
        this.agridataStateService.setActiveUid(defaultUid);
        return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, defaultUid]);
      }
    } catch (err) {
      console.error(err);
    }
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }
}
