import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';

import { ExceptionDto } from '@/entities/openapi';
import { DebugService } from '@/features/debug/debug.service';

// Symbol to mark enhanced errors
export const METHOD_ENHANCED = Symbol('methodEnhanced');

// Type for the enhanced error
export type HttpErrorWithMethod = HttpErrorResponse & {
  method: string;
  [METHOD_ENHANCED]: boolean;
};

// Type guard to check if error has method
export function hasMethod(error: unknown): error is HttpErrorWithMethod {
  return error instanceof HttpErrorResponse && METHOD_ENHANCED in error;
}

export function getErrorMethod(error: HttpErrorResponse): string | undefined {
  return hasMethod(error) ? error.method : undefined;
}

export const errorHttpInterceptor: HttpInterceptorFn = (req, next) => {
  const debugService = inject(DebugService);
  if (req) {
    debugService.addRequest(req.url, req.method);
  }
  return next(req).pipe(
    tap((event) => {
      // Track successful responses
      if (event.type !== 0) {
        // type 0 is HttpEventType.Sent, we want to track actual responses
        debugService.addResponse(req.url, req.method, 200, 'OK', false);
      }
    }),
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        // Extract requestId from backend error if available
        const backendError = error.error;
        let requestId: string | undefined;
        if (backendError && isExceptionDto(backendError)) {
          requestId = backendError.requestId;
        }

        // Track failed responses
        debugService.addResponse(
          req.url,
          req.method,
          error.status,
          error.statusText || 'Error',
          true,
          requestId,
        );
        // Enhance the original error with method property
        const errorWithMethod = enhanceHttpErrorWithMethod(error, req.method);
        return throwError(() => errorWithMethod);
      }
      return throwError(() => error);
    }),
  );
};

function isExceptionDto(obj: unknown): obj is ExceptionDto {
  return obj !== null && typeof obj === 'object' && 'requestId' in obj;
}

export function enhanceHttpErrorWithMethod(
  error: HttpErrorResponse,
  method: string,
): HttpErrorWithMethod {
  if (hasMethod(error)) {
    return error; // Already enhanced
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
