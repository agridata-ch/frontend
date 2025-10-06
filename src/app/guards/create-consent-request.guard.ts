import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';

/**
 * Guard to create consent requests for a given data request and handle navigation based on the
 * created consent requests and the active user UID.
 * It checks for the presence of a dataRequestUid in the route parameters and optionally a uid
 * in the query parameters. If a uid is provided, it verifies that the uid is in the list of
 * authorized uids for the current user. It then creates consent requests for the specified
 * data request and navigates to the appropriate consent request detail page based on the active
 * uid or redirects to the consent request producer overview if no matching consent request is found.
 *
 * CommentLastReviewed: 2025-10-14
 */
@Injectable({
  providedIn: 'root',
})
export class CreateConsentRequestGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly participantService = inject(UserService);

  async canActivate(route: ActivatedRouteSnapshot) {
    const dataRequestUid = route.paramMap.get('dataRequestUid') ?? '';
    const redirectUrl = route.queryParamMap.get('redirect_uri') ?? null;
    const uid = route.queryParamMap.get('uid') ?? null;

    if (!dataRequestUid) {
      return this.fail(new Error('No dataRequestUid provided in route parameters.'));
    }

    if (uid) {
      const uidDtos = this.agridataStateService.userUidsLoaded()
        ? this.agridataStateService.userUids()
        : await this.participantService.getAuthorizedUids();

      if (!uidDtos.some((userUid) => userUid.uid === uid)) {
        return this.fail(new Error('Provided uid is not in the list of authorized uids: ' + uid));
      }

      this.agridataStateService.setActiveUid(uid);
    }

    try {
      const consentRequests =
        await this.consentRequestService.createConsentRequests(dataRequestUid);
      if (!consentRequests || consentRequests.length === 0) {
        return this.fail(
          new Error('No consent requests created for dataRequestUid: ' + dataRequestUid),
        );
      }

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
      return error instanceof Error
        ? this.fail(error)
        : this.fail(
            new Error('Unknown error occurred during consent request creation', { cause: error }),
          );
    }
  }

  private fail(error: Error) {
    this.errorService.handleError(error);
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }
}
