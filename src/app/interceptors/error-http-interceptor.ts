import {
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpInterceptorFn,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap, throwError } from 'rxjs';

import { ExternalServiceHttpError } from '@/app/error/external-service-http-error';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ExceptionDto, ExceptionEnum } from '@/entities/openapi';
import { DebugService } from '@/features/debug/debug.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';

// Symbol to mark enhanced errors
export const METHOD_ENHANCED = Symbol('methodEnhanced');

// Context token to enable special 502/504 handling for the authorized UIDs endpoint
export const AUTHORIZED_UIDS_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

// Type for the enhanced error
export type HttpErrorWithMethod = HttpErrorResponse & {
  method: string;
  [METHOD_ENHANCED]: boolean;
};

const MAINTENANCE_MODE_WHITELIST = new Set([
  '/',
  `/${ROUTE_PATHS.PRIVACY_POLICY_PATH}`,
  `/${ROUTE_PATHS.IMPRESSUM_PATH}`,
  `/${ROUTE_PATHS.NOT_FOUND}`,
  `/${ROUTE_PATHS.ERROR}`,
  `/${ROUTE_PATHS.FORBIDDEN}`,
  `/${ROUTE_PATHS.MAINTENANCE}`,
]);

/**
 * HTTP interceptor that enhances errors with request method and handles maintenance mode
 *
 * CommentLastReviewed: 2025-10-27
 */
export const errorHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const debugService = inject(DebugService);
  const router = inject(Router);
  const authService = inject(AuthService);
  const stateService = inject(AgridataStateService);

  trackRequest(debugService, req.url, req.method);

  return next(req).pipe(
    tap((event) => trackSuccessfulResponse(debugService, req.url, req.method, event)),
    catchError((error) => handleError(error, req, debugService, router, authService, stateService)),
  );
};

function trackRequest(debugService: DebugService, url: string, method: string): void {
  debugService.addRequest(url, method);
}

function trackSuccessfulResponse(
  debugService: DebugService,
  url: string,
  method: string,
  event: HttpEvent<unknown>,
): void {
  // Track successful responses (type 0 is HttpEventType.Sent, we want to track actual responses)
  if (event.type !== 0) {
    debugService.addResponse(url, method, 200, 'OK', false);
  }
}

function handleError(
  error: unknown,
  req: HttpRequest<unknown>,
  debugService: DebugService,
  router: Router,
  authService: AuthService,
  stateService: AgridataStateService,
): Observable<HttpEvent<unknown>> {
  if (!(error instanceof HttpErrorResponse)) {
    return throwError(() => error);
  }

  const backendError = error.error;
  const requestId = extractRequestId(backendError);

  trackFailedResponse(debugService, req.url, req.method, error, requestId);

  if (shouldNavigateToMaintenance(backendError, authService, stateService)) {
    return navigateToMaintenanceAndComplete(router, error);
  }

  if (req.context.get(AUTHORIZED_UIDS_ERROR_HANDLING)) {
    if (error.status === 504) {
      authService.clearAuthorizedUidsCache();
      return throwError(() => new ExternalServiceHttpError());
    }
    if (error.status === 502) {
      authService.clearAuthorizedUidsCache();
      stateService.setUidMissing(true);
      return of(new HttpResponse({ status: 200, body: [] }));
    }
  }

  const errorWithMethod = enhanceHttpErrorWithMethod(error, req.method);
  return throwError(() => errorWithMethod);
}

function extractRequestId(backendError: unknown): string | undefined {
  return backendError && isExceptionDto(backendError) ? backendError.requestId : undefined;
}

function trackFailedResponse(
  debugService: DebugService,
  url: string,
  method: string,
  error: HttpErrorResponse,
  requestId: string | undefined,
): void {
  debugService.addResponse(url, method, error.status, error.statusText || 'Error', true, requestId);
}

function shouldNavigateToMaintenance(
  backendError: unknown,
  authService: AuthService,
  stateService: AgridataStateService,
): boolean {
  if (!isExceptionDto(backendError) || backendError.type !== ExceptionEnum.Maintenance) {
    return false;
  }

  if (!authService.isAuthenticated()) {
    return false;
  }

  const currentRoute = stateService.currentRouteWithoutQueryParams() || '';
  return !MAINTENANCE_MODE_WHITELIST.has(currentRoute);
}

function navigateToMaintenanceAndComplete(
  router: Router,
  error: HttpErrorResponse,
): Observable<HttpEvent<unknown>> {
  void router.navigate([ROUTE_PATHS.MAINTENANCE]);
  return throwError(() => error);
}

export function enhanceHttpErrorWithMethod(
  error: HttpErrorResponse,
  method: string,
): HttpErrorWithMethod {
  if (hasMethod(error)) {
    return error;
  }

  Object.defineProperties(error, {
    method: {
      value: method,
      writable: false,
      enumerable: true,
    },
    [METHOD_ENHANCED]: {
      value: true,
      writable: false,
      enumerable: false,
    },
  });

  return error as HttpErrorWithMethod;
}

export function getErrorMethod(error: HttpErrorResponse): string | undefined {
  return hasMethod(error) ? error.method : undefined;
}

export function hasMethod(error: unknown): error is HttpErrorWithMethod {
  return error instanceof HttpErrorResponse && METHOD_ENHANCED in error;
}

function isExceptionDto(obj: unknown): obj is ExceptionDto {
  return obj !== null && typeof obj === 'object' && 'requestId' in obj;
}
