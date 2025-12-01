import { inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UidDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

/**
 * Guard to load the producers authorized uids and set the consent request uid parameter if not present or set active uid if parameter is provided.
 *
 * CommentLastReviewed: 2025-12-01
 */
@Injectable({
  providedIn: 'root',
})
export class ProducerUidGuard implements CanActivate {
  // Injects
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly authorizationService = inject(AuthService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);

  async canActivate(route: ActivatedRouteSnapshot): Promise<UrlTree | boolean> {
    try {
      const uidDtos = await this.authorizationService.initializeAuthorizedUids();
      return this.validateAndSetUid(route, uidDtos);
    } catch (error) {
      return this.processError(error);
    }
  }

  private validateAndSetUid(route: ActivatedRouteSnapshot, uidDtos: UidDto[]): UrlTree | boolean {
    const userUid = route.paramMap.get('uid') ?? '';
    const authorizedUids = uidDtos.map((uid) => uid.uid);

    if (userUid) {
      return this.handleProvidedUid(userUid, authorizedUids);
    }

    return this.handleMissingUid(route, uidDtos);
  }

  private handleMissingUid(route: ActivatedRouteSnapshot, uidDtos: UidDto[]): UrlTree | boolean {
    if (!this.isConsentRequestProducerPath(route)) {
      return true;
    }

    const defaultUid = this.agridataStateService.getDefaultUid(uidDtos);

    if (!defaultUid) {
      this.errorService.handleError(new Error('user has no authorized uids'));
      return this.createErrorUrlTree();
    }

    this.agridataStateService.setActiveUid(defaultUid);

    if (this.isConsentRequestCreatePath(route)) {
      return true;
    }

    return this.router.createUrlTree([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, defaultUid]);
  }

  private handleProvidedUid(userUid: string, authorizedUids: string[]): UrlTree | boolean {
    if (!authorizedUids.includes(userUid)) {
      return this.fail(new Error(`invalid url, user does not have access to uid: ${userUid}`));
    }

    if (userUid !== this.agridataStateService.activeUid()) {
      this.agridataStateService.setActiveUid(userUid);
    }

    return true;
  }

  private isConsentRequestCreatePath(route: ActivatedRouteSnapshot): boolean {
    return route.url[0]?.path === ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_CREATE_SUBPATH;
  }

  private isConsentRequestProducerPath(route: ActivatedRouteSnapshot): boolean {
    return route?.parent?.url.at(0)?.path === ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH;
  }

  private processError(error: unknown): UrlTree {
    return error instanceof Error
      ? this.fail(error)
      : this.fail(new Error('Unknown error occurred in producer-uid guard', { cause: error }));
  }

  private createErrorUrlTree(): UrlTree {
    return this.router.parseUrl(ROUTE_PATHS.ERROR);
  }

  private fail(error: Error): UrlTree {
    this.errorService.handleError(error);
    return this.createErrorUrlTree();
  }
}
