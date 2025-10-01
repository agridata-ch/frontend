import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';

/**
 * Guard to create consent requests for a given data request and redirect to the created consent request.
 * it also handles the optional redirect_uri query parameter to pass it to the consent request page,
 * and also handles setting the active uid if provided in the query parameters.
 *
 * CommentLastReviewed: 2025-10-01
 */
@Injectable({
  providedIn: 'root',
})
export class CreateConsentRequestGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly participantService = inject(UserService);

  async canActivate(route: ActivatedRouteSnapshot) {
    const dataRequestUid = route.paramMap.get('dataRequestUid') ?? '';
    const redirectUrl = route.queryParamMap.get('redirect_uri') ?? null;
    const uid = route.queryParamMap.get('uid') ?? null;

    if (!dataRequestUid) {
      return this.fail('No dataRequestUid provided in route parameters.');
    }

    if (uid) {
      const uidDtos = this.agridataStateService.userUidsLoaded()
        ? this.agridataStateService.userUids()
        : await this.participantService.getAuthorizedUids();

      if (!uidDtos.some((userUid) => userUid.uid === uid)) {
        return this.fail('Provided uid is not in the list of authorized uids: ' + uid);
      }

      this.agridataStateService.setActiveUid(uid);
    }

    try {
      const consentRequests =
        await this.consentRequestService.createConsentRequests(dataRequestUid);
      if (!consentRequests || consentRequests.length === 0) {
        return this.fail('No consent requests created for dataRequestUid: ' + dataRequestUid);
      }
      this.consentRequestService.fetchConsentRequests.reload();

      const activeUid = this.agridataStateService.activeUid();

      if (!activeUid) {
        return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
      }

      const consentRequestToOpen = consentRequests.find((cr) => cr.dataProducerUid === activeUid);
      if (consentRequestToOpen) {
        // if a redirectUrl is present we need to use navigate instead of creating a UrlTree
        // because we need to pass state (redirect_uri)
        if (redirectUrl) {
          this.router.navigate(
            [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, activeUid, consentRequestToOpen.id],
            { state: { redirect_uri: redirectUrl } },
          );
          // return false to cancel the current navigation
          return false;
        }
        return this.router.createUrlTree([
          ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
          activeUid,
          consentRequestToOpen.id,
        ]);
      }
      return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    } catch (error) {
      return this.fail('Error creating consent requests:' + error);
    }
  }

  private fail(msg: string) {
    console.error('[CreateConsentRequestGuard]', msg);
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }
}
