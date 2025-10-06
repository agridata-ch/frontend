import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { GlobalErrorHandler } from '@/app/error/global-error-handler';
import { mockErrorHandlerService } from '@/shared/testing/mocks/mock-error-handler-service';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let errorHandlerService: Partial<ErrorHandlerService>;

  beforeEach(() => {
    errorHandlerService = mockErrorHandlerService;
    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: ErrorHandlerService, useValue: errorHandlerService },
      ],
    });
    errorHandler = TestBed.inject(GlobalErrorHandler);
    jest.clearAllMocks();
  });

  it('should delegate frontend errors to ErrorHandlerService', () => {
    const error = new Error('Frontend error');
    errorHandler.handleError(error);
    expect(errorHandlerService.handleError).toHaveBeenCalledWith(error);
  });

  it('should delegate HttpErrorResponse to ErrorHandlerService', () => {
    const httpError = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });
    errorHandler.handleError(httpError);
    expect(errorHandlerService.handleError).toHaveBeenCalledWith(httpError);
  });
});
