import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { environment } from '@/environments/environment';

// Mutating methods are blocked while consent is missing; GET (and other safe reads) are allowed so
// the page still renders behind the modal instead of showing errors.
const BLOCKED_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

// The accept endpoint (a POST) must stay reachable while blocked, otherwise the block could never
// be resolved.
const CONSENT_ENDPOINT_WHITELIST = ['agb-revisions'];

/**
 * Blocks mutating API requests while AGB consent is enforced-and-missing, so a consumer/provider
 * cannot change any data before accepting — even if the modal is removed from the DOM. Read requests
 * are left untouched so the UI still renders behind the modal without errors.
 *
 * CommentLastReviewed: 2026-07-28
 */
export const agbConsentInterceptor: HttpInterceptorFn = (req, next) => {
  const stateService = inject(AgridataStateService);

  const isApiRequest = req.url.startsWith(environment.apiBaseUrl);
  const isBlockedMethod = BLOCKED_METHODS.has(req.method);
  const isWhitelisted = CONSENT_ENDPOINT_WHITELIST.some((path) => req.url.includes(path));

  if (stateService.agbConsentEnforced() && isApiRequest && isBlockedMethod && !isWhitelisted) {
    return throwError(
      () => new HttpErrorResponse({ status: 423, statusText: 'Locked', url: req.url }),
    );
  }

  return next(req);
};
