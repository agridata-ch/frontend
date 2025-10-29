import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, inject, Injectable } from '@angular/core';

import { ErrorHandlerService } from '@/app/error/error-handler.service';

/**
 * Global error handler that delegates error processing to the ErrorHandlerService.
 * It captures both frontend and backend errors and ensures they are handled
 * consistently across the application.
 *
 * CommentLastReviewed: 2025-10-14
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly errorService = inject(ErrorHandlerService);

  handleError(error: Error | HttpErrorResponse): void {
    this.errorService.handleError(error);
  }
}
