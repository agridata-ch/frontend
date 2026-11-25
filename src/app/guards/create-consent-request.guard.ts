import { HttpErrorResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { lastValueFrom } from 'rxjs';

import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestCreatedDto, CreateConsentRequestDto, UidDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ExternalServiceHttpError } from '@/shared/error/external-service-http-error';
import { AuthService } from '@/shared/lib/auth';
import { getRedirectUri, REDIRECT_URI_QUERY_PARAM } from '@/shared/lib/redirect-uri.helper';

export enum InvitationErrorKey {
  InvalidLink = 'invalidLink',
  NoCompanies = 'noCompanies',
  NotFound = 'notFound',
  TechnicalError = 'technicalError',
  UidNotAuthorized = 'uidNotAuthorized',
}

/**
 * Guard to create consent requests for a given data request and handle navigation based on the
 * created consent requests and the active user UID.
 * It checks for the presence of a dataRequestId in the route parameters and optionally a uid
 * in the query parameters. If a uid is provided, it verifies that the uid is in the list of
 * authorized uids for the current user. It then creates consent requests for the specified
 * data request and navigates to the consent request detail page for the active uid.
 * Every failure leads to the error page with a specific message; a given redirect_uri is passed
 * along so the producer can return to the consumer's application from there.
 *
 * CommentLastReviewed: 2026-11-25
 */
@Service()
export class CreateConsentRequestGuard implements CanActivate {
  // Injects
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authService = inject(AuthService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<UrlTree | boolean> {
    const { dataRequestId, redirectUrl, uid } = this.extractRouteParameters(route);
    const queryParams: Record<string, string> = redirectUrl
      ? { [REDIRECT_URI_QUERY_PARAM]: redirectUrl }
      : {};

    if (!dataRequestId) {
      return this.fail(
        new Error('No dataRequestId provided in route parameters.'),
        InvitationErrorKey.InvalidLink,
        queryParams,
      );
    }

    try {
      const uidDtos = await this.authService.initializeAuthorizedUids();

      if (!uidDtos || uidDtos.length === 0) {
        return this.fail(
          new Error('user has no uids'),
          InvitationErrorKey.NoCompanies,
          queryParams,
        );
      }

      if (uid) {
        if (!this.isValidUid(uid, uidDtos)) {
          return this.fail(
            new Error(`Provided uid is not authorized: ${uid}`),
            InvitationErrorKey.UidNotAuthorized,
            queryParams,
          );
        }
        this.agridataStateService.setActiveUid(uid);
      }

      const createConsentRequestDtos = this.buildConsentRequestDtos(dataRequestId, uidDtos, uid);
      const consentRequests = await lastValueFrom(
        this.consentRequestService.createConsentRequests(createConsentRequestDtos),
      );

      return !consentRequests || consentRequests.length === 0
        ? this.fail(
            new Error(`No consent requests created for dataRequestId: ${dataRequestId}`),
            InvitationErrorKey.TechnicalError,
            queryParams,
          )
        : this.navigateToConsentRequest(consentRequests, dataRequestId, queryParams);
    } catch (error) {
      return error instanceof ExternalServiceHttpError
        ? this.router.createUrlTree([ROUTE_PATHS.EXTERNAL_SERVICE_ERROR], { queryParams })
        : this.fail(this.toError(error), this.errorKey(error, uid), queryParams);
    }
  }

  private buildConsentRequestDtos(
    dataRequestId: string,
    uidDtos: UidDto[],
    uid?: string,
  ): CreateConsentRequestDto[] {
    return uid
      ? [{ dataRequestId, uid }]
      : [...uidDtos].map((userUid) => ({ dataRequestId, uid: userUid.uid }));
  }

  // A 403 only blames the UID when the link actually named one.
  private errorKey(error: unknown, uid?: string): InvitationErrorKey {
    const status = error instanceof HttpErrorResponse ? error.status : undefined;
    if (status === 404) {
      return InvitationErrorKey.NotFound;
    }
    return status === 403 && uid
      ? InvitationErrorKey.UidNotAuthorized
      : InvitationErrorKey.TechnicalError;
  }

  private extractRouteParameters(route: ActivatedRouteSnapshot): {
    dataRequestId?: string;
    redirectUrl?: string;
    uid?: string;
  } {
    const dataRequestId = route.paramMap.get('dataRequestId') ?? '';
    const uid = route.queryParamMap.get('uid');

    return {
      dataRequestId,
      redirectUrl: getRedirectUri(route),
      uid: uid ?? undefined,
    };
  }

  private fail(
    error: Error | HttpErrorResponse,
    key: InvitationErrorKey,
    queryParams: Record<string, string>,
  ): UrlTree {
    this.errorService.handleError(
      error,
      { i18n: `errors.invitation.${key}.message` },
      { i18n: `errors.invitation.${key}.title` },
    );
    return this.router.createUrlTree([ROUTE_PATHS.ERROR], { queryParams });
  }

  private isValidUid(uid: string, uidDtos: UidDto[]): boolean {
    return uidDtos.some((userUid) => userUid.uid === uid);
  }

  private navigateToConsentRequest(
    consentRequests: ConsentRequestCreatedDto[],
    dataRequestId: string,
    queryParams: Record<string, string>,
  ): UrlTree {
    let activeUid = this.agridataStateService.activeUid();

    if (!activeUid && consentRequests.length > 0) {
      activeUid = consentRequests[0].dataProducerUid;
      this.agridataStateService.setActiveUid(activeUid);
    }

    return this.router.createUrlTree(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, activeUid, dataRequestId],
      { queryParams },
    );
  }

  private toError(error: unknown): Error | HttpErrorResponse {
    return error instanceof Error || error instanceof HttpErrorResponse
      ? error
      : new Error('Unknown error occurred during consent request creation', { cause: error });
  }
}
