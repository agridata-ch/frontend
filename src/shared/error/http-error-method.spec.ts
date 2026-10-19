import { HttpErrorResponse } from '@angular/common/http';

import { ExceptionEnum } from '@/entities/openapi';

import { getBackendErrorType } from './http-error-method';

describe('getBackendErrorType', () => {
  it.each([
    ['a JSON string body', JSON.stringify({ type: ExceptionEnum.ExportLimitExceeded })],
    ['an object body', { type: ExceptionEnum.ExportLimitExceeded }],
  ])('should read the type from %s', (_label, error) => {
    expect(getBackendErrorType(new HttpErrorResponse({ status: 400, error }))).toBe(
      ExceptionEnum.ExportLimitExceeded,
    );
  });

  it.each([
    ['invalid JSON', new HttpErrorResponse({ status: 500, error: 'not json' })],
    ['a body without type', new HttpErrorResponse({ status: 500, error: { requestId: 'r' } })],
    ['an unknown type', new HttpErrorResponse({ status: 500, error: { type: 'NOPE' } })],
    ['a null body', new HttpErrorResponse({ status: 500, error: null })],
    ['a non-HTTP error', new Error('boom')],
  ])('should be undefined for %s', (_label, error) => {
    expect(getBackendErrorType(error)).toBeUndefined();
  });
});
