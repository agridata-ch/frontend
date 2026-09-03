import { HttpContextToken, HttpErrorResponse } from '@angular/common/http';

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
