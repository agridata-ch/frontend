import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, type Signal, signal, WritableSignal } from '@angular/core';

import { ErrorDto, TranslationItem } from '@/app/error/error-dto';
import { getErrorMethod } from '@/app/interceptors/error-http-interceptor';
import { ExceptionDto } from '@/entities/openapi';
import { environment } from '@/environments/environment';

export interface ResourceValueError extends Error {
  cause: ErrorWithCause;
}

export interface ErrorWithCause extends Error {
  cause: HttpErrorResponse;
}

/**
 * Service to handle errors globally and locally within the application.
 * It allows registration of local error handlers that can capture and manage errors
 * independently of the global error handler.
 *
 * Features:
 * - Global error handling for uncaught errors.
 * - Registration and unregistration of local error handlers.
 * - Each handler maintains its own queue of errors.
 * - Errors can be marked as handled, removing them from the active queue.
 * - Errors are enriched with i18n messages based on HTTP status codes and methods.
 * - All errors are tracked for auditing and debugging purposes.
 * - Clear all errors from all handlers.
 *
 * CommentLastReviewed: 2025-10-08
 */
@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService implements OnDestroy {
  // Track all errors that occur in the application
  private readonly allErrors = signal<ErrorDto[]>([]);

  // Map of queue IDs to error signals
  private readonly errorQueues = new Map<string, WritableSignal<ErrorDto[]>>();

  // Global handler is always available as fallback
  private readonly globalQueueId = 'global';

  // Track registration order for finding the active handler
  private readonly queueOrder = signal<string[]>([]);

  private cleanupInterval?: ReturnType<typeof setInterval>;

  constructor() {
    this.errorQueues.set(this.globalQueueId, signal<ErrorDto[]>([]));
    this.queueOrder.update((order) => [...order, this.globalQueueId]);

    this.startCleanupInterval();
  }

  handleError(error: Error | HttpErrorResponse, reason?: TranslationItem): ErrorDto {
    if (this.isResourceValueError(error)) {
      error = error.cause.cause;
    }
    if (this.isErrorWithCause(error)) {
      error = error.cause;
    }
    console.error(error);
    const errorDto = this.createErrorDto(error, reason);
    this.addError(errorDto);

    // Assign to most recently registered handler or global
    const targetQueueId = this.getActiveQueueId();
    const targetQueue = this.errorQueues.get(targetQueueId);

    if (targetQueue && !this.isFeErrorInProduction(errorDto)) {
      targetQueue.update((errors) => [...errors, errorDto]);
    }

    return errorDto;
  }

  registerHandler(): string {
    const id = `handler-${crypto.randomUUID()}`;

    this.errorQueues.set(id, signal<ErrorDto[]>([]));

    // Add to front of order list (highest priority)
    this.queueOrder.update((order) => [id, ...order]);

    return id;
  }

  unregisterHandler(handlerId: string): void {
    this.markAllErrorsOfHandlerAsHandled(handlerId);
    this.errorQueues.delete(handlerId);
    this.queueOrder.update((order) => order.filter((id) => id !== handlerId));
  }

  markAllErrorsOfHandlerAsHandled(handlerId: string): void {
    const queueSignal = this.errorQueues.get(handlerId);
    if (!queueSignal) return;

    // Update error status in allErrors
    const queueErrors = queueSignal();
    const queueErrorIds = new Set(queueErrors.map((e) => e.id));

    this.allErrors.update((allErrors) =>
      allErrors.map((error) =>
        queueErrorIds.has(error.id) ? { ...error, isHandled: true } : error,
      ),
    );

    queueSignal.set([]);
  }

  markAllAsHandled() {
    this.allErrors.update((allErrors) =>
      allErrors.map((error) => {
        return { ...error, isHandled: true };
      }),
    );
    this.errorQueues.forEach((queue) => queue.set([]));
  }

  getHandlerIds() {
    return Array.from(this.errorQueues.keys());
  }

  getErrorsForHandler(handlerId: string): Signal<ErrorDto[]> {
    const queueSignal = this.errorQueues.get(handlerId);
    return queueSignal || signal<ErrorDto[]>([]);
  }

  getGlobalErrors(): Signal<ErrorDto[]> {
    return this.getErrorsForHandler(this.globalQueueId);
  }

  markAllGlobalAsHandled(): void {
    this.markAllErrorsOfHandlerAsHandled(this.globalQueueId);
  }

  getAllErrors(): Signal<ErrorDto[]> {
    return this.allErrors.asReadonly();
  }

  ngOnDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.removeOldErrors();
    }, 60000);
  }

  private removeOldErrors(): void {
    this.allErrors.update((errors) => {
      if (errors.length <= 10) {
        return errors;
      }

      // Sort by timestamp (newest first) and keep only the last 10
      return [...errors].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10);
    });
  }

  private addError(error: ErrorDto): void {
    this.allErrors.update((errors) => [...errors, error]);
  }

  private createErrorDto(error: Error | HttpErrorResponse, reason?: TranslationItem): ErrorDto {
    const isFeError = !(error instanceof HttpErrorResponse);

    const i18nTitle: TranslationItem = { i18n: 'errors.frontend.unexpected.title' };
    const i18nReason: TranslationItem = { i18n: 'errors.frontend.unexpected.details' };
    let i18nPath: TranslationItem | undefined;
    let i18nErrorId: TranslationItem | undefined;

    let url: string | undefined;
    let method: string | undefined;
    if (isFeError) {
      i18nReason.i18nParameter = {
        errorDetails:
          typeof error.message === 'object' ? JSON.stringify(error.message) : error.message,
      };
    } else {
      url = error.url ?? undefined;
      method = getErrorMethod(error);
      i18nTitle.i18n = this.get18nMessageByMethod(method);
      i18nReason.i18n = this.get18nMessageByStatus(error.status);
      i18nReason.i18nParameter = { status: error.status.toString() };
      i18nPath = this.getPathTranslationItem(url, method);
      const backendError = error.error;
      if (backendError && this.isExceptionDto(backendError)) {
        i18nErrorId = {
          i18n: 'errors.backend.errorId',
          i18nParameter: { errorId: backendError.requestId },
        };
      }
    }

    return {
      id: this.generateErrorId(error),
      isFrontendError: isFeError,
      i18nTitle: i18nTitle,
      i18nReason: reason ?? i18nReason,
      i18nPath: i18nPath,
      i18nErrorId: i18nErrorId,
      originalError: error,
      timestamp: new Date(),
      isHandled: false,
      url: url,
      method: method,
    };
  }

  private getPathTranslationItem(
    url: string | undefined,
    method: string | undefined,
  ): TranslationItem | undefined {
    if (!url) return undefined;
    const path = this.extractApiPath(url);
    if (path) {
      return { i18n: 'errors.backend.path', i18nParameter: { path: path, method: method ?? '' } };
    }
    return undefined;
  }

  private getActiveQueueId(): string {
    // Return first non-global handler or global
    const order = this.queueOrder();
    for (const id of order) {
      if (id !== this.globalQueueId) return id;
    }
    return this.globalQueueId;
  }

  private generateErrorId(error: Error | HttpErrorResponse): string {
    const timestamp = Date.now();
    const errorMsg =
      error instanceof HttpErrorResponse ? `${error.status}-${error.url}` : error.message;
    return `error-${errorMsg.substring(0, 20)}-${timestamp}`;
  }

  private get18nMessageByStatus(status: number): string {
    switch (status) {
      case 400:
        return 'errors.backend.badRequest';
      case 401:
        return 'errors.backend.unauthorized';
      case 403:
        return 'errors.backend.forbidden';
      case 404:
        return 'errors.backend.notFound';
      case 500:
        return 'errors.backend.internalServerError';
      case 502:
        return 'errors.backend.serviceUnavailable';
      case 503:
        return 'errors.backend.serviceUnavailable';
      default:
        return 'errors.backend.unexpected';
    }
  }

  private isExceptionDto(obj: unknown): obj is ExceptionDto {
    return obj !== null && typeof obj === 'object' && 'requestId' in obj;
  }

  // todo DIGIB2-949 check if there is a better way to identify this error type with angular 21
  private isErrorWithCause(error: unknown): error is ErrorWithCause {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cause = (error as any)?.cause;
    return cause instanceof HttpErrorResponse;
  }

  // todo DIGIB2-949 check if there is a better way to identify this error type with angular 21
  private isResourceValueError(error: unknown): error is ResourceValueError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cause = (error as any)?.cause?.cause;
    return cause instanceof HttpErrorResponse;
  }

  /**
   * Extracts the API path after the version from a URL.
   * Example: "http://localhost:8060/api/agreement/v1/consent-requests?dataProducerUid=CHE***142"
   * Returns: "agreement/consent-requests"
   */
  private extractApiPath(url: string): string {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;

      // Find /api/ segment
      const apiIndex = pathname.indexOf('/api/');
      if (apiIndex === -1) {
        return url;
      }

      // Get everything after /api/
      const afterApi = pathname.substring(apiIndex + 5); // 5 = length of '/api/'

      // Split by '/' and filter out version segments (v1, v2, etc.)
      const segments = afterApi.split('/').filter((segment) => segment && !/^v\d+$/i.exec(segment));

      return segments.join('/');
    } catch {
      return url;
    }
  }

  private get18nMessageByMethod(method: string | undefined): string {
    let i18n = `errors.backend.generic.title`;

    const acceptedMethods = ['get', 'post', 'put', 'delete', 'patch'];
    if (method && acceptedMethods.includes(method.toLowerCase())) {
      i18n = `errors.backend.method.${method.toLowerCase()}`;
    }
    return i18n;
  }

  private isFeErrorInProduction(error: ErrorDto) {
    return error.isFrontendError && environment.production;
  }
}
