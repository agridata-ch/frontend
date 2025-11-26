import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { catchError, mergeMap, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestCreatedDto, CreateConsentRequestDto, UidDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Guard to create consent requests for a given data request and handle navigation based on the
 * created consent requests and the active user UID.
 * It checks for the presence of a dataRequestUid in the route parameters and optionally a uid
 * in the query parameters. If a uid is provided, it verifies that the uid is in the list of
 * authorized uids for the current user. It then creates consent requests for the specified
 * data request and navigates to the appropriate consent request detail page based on the active
 * uid or redirects to the consent request producer overview if no matching consent request is found.
 *
 * CommentLastReviewed: 2025-10-23
 */
@Injectable({
  providedIn: 'root',
})
export class CreateConsentRequestGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authService = inject(AuthService);

  canActivate(route: ActivatedRouteSnapshot) {
    const { dataRequestUid, uid, redirectUrl } = this.extractRouteParameters(route);

    if (!dataRequestUid) {
      return of(this.fail(new Error('No dataRequestUid provided in route parameters.')));
    }

    return this.authService.initializeAuthorizedUids().pipe(
      mergeMap((uidDtos) => {
        if (!uidDtos) {
          return of(this.fail(new Error(`user has no uids`)));
        }

        if (uid) {
          if (!this.isValidUid(uid, uidDtos)) {
            return of(this.fail(new Error(`Provided uid is not authorized: ${uid}`)));
          }
          this.agridataStateService.setActiveUid(uid);
        }

        const createConsentRequestDtos = this.buildConsentRequestDtos(dataRequestUid, uidDtos, uid);
        return this.consentRequestService.createConsentRequests(createConsentRequestDtos).pipe(
          map((consentRequests) => {
            if (!consentRequests || consentRequests.length === 0) {
              return this.fail(
                new Error(`No consent requests created for dataRequestUid: ${dataRequestUid}`),
              );
            }
            return this.navigateToConsentRequest(consentRequests, redirectUrl);
          }),
        );
      }),
      catchError((error) => of(this.handleError(error))),
    );
  }

  private buildConsentRequestDtos(
    dataRequestId: string,
    uidDtos: UidDto[],
    uid?: string,
  ): CreateConsentRequestDto[] {
    return uid
      ? [{ uid, dataRequestId: dataRequestId }]
      : [...uidDtos].map((userUid) => ({ uid: userUid.uid, dataRequestId: dataRequestId }));
  }

  private extractRouteParameters(route: ActivatedRouteSnapshot): {
    dataRequestUid?: string;
    uid?: string;
    redirectUrl?: string;
  } {
    const dataRequestUid = route.paramMap.get('dataRequestUid') ?? '';
    const uid = route.queryParamMap.get('uid');
    const redirectUrl = route.queryParamMap.get('redirect_uri');

    return {
      dataRequestUid,
      uid: uid ?? undefined,
      redirectUrl: redirectUrl ?? undefined,
    };
  }

  private fail(error: Error) {
    this.errorService.handleError(error);
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }

  private isValidUid(uid: string, uidDtos: UidDto[]) {
    return uidDtos.some((userUid) => userUid.uid === uid);
  }

  private navigateToConsentRequest(
    consentRequests: ConsentRequestCreatedDto[],
    redirectUrl?: string,
  ) {
    const activeUid = this.agridataStateService.activeUid();

    if (!activeUid) {
      return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
    }

    const consentRequestToOpen = [...consentRequests].find(
      (cr) => cr.dataProducerUid === activeUid,
    );

    if (consentRequestToOpen) {
      const queryParams = redirectUrl ? { redirect_uri: redirectUrl } : {};
      return this.router.createUrlTree(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, activeUid, consentRequestToOpen.id],
        { queryParams },
      );
    }

    return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH]);
  }

  private handleError(error: unknown) {
    return error instanceof Error
      ? this.fail(error)
      : this.fail(
          new Error('Unknown error occurred during consent request creation', { cause: error }),
        );
  }
}
