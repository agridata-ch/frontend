import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';

import { ExceptionEnum } from '@/entities/openapi';

// Symbol to mark enhanced errors
export const METHOD_ENHANCED = Symbol('methodEnhanced');

// Context token to enable special 502/504 handling for the authorized UIDs endpoint
export const AUTHORIZED_UIDS_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

// Type for the enhanced error
export type HttpErrorWithMethod = HttpErrorResponse & {
  method: string;
  [METHOD_ENHANCED]: boolean;
};

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

// True when the backend answered with an EXTERNAL_SERVICE_ERROR, which for a UID lookup means the
// UID does not exist. Callers can then show inline validation instead of a global error.
export function isExternalServiceError(error: unknown): boolean {
  return getBackendErrorType(error) === ExceptionEnum.ExternalServiceError;
}

// Returns the backend exception type of an HTTP error. Non-JSON requests (e.g. a CSV export with
// responseType 'text') deliver the error body as a raw JSON string, so it is parsed first.
export function getBackendErrorType(error: unknown): ExceptionEnum | undefined {
  if (!(error instanceof HttpErrorResponse)) {
    return undefined;
  }
  const body = parseErrorBody(error.error);
  return body !== null && typeof body === 'object' && 'type' in body
    ? Object.values(ExceptionEnum).find((type) => type === body.type)
    : undefined;
}

function parseErrorBody(body: unknown): unknown {
  if (typeof body !== 'string') {
    return body;
  }
  try {
    return JSON.parse(body);
  } catch {
    return undefined;
  }
}
