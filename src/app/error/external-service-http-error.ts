/**
 * Thrown by errorHttpInterceptor for 504 responses on the authorized UIDs endpoint.
 * Guards catch this and navigate to the external-service-error page without registering an error.
 *
 * CommentLastReviewed: 2026-04-15
 */
export class ExternalServiceHttpError extends Error {
  constructor() {
    super('external service unavailable');
  }
}
