import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { GlobalErrorHandler } from '@/app/error/global-error-handler';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { createMockErrorHandlerService, MockErrorHandlerService } from '@/shared/testing/mocks';

describe('GlobalErrorHandler', () => {
  let errorHandler: GlobalErrorHandler;
  let errorHandlerService: MockErrorHandlerService;

  beforeEach(() => {
    errorHandlerService = createMockErrorHandlerService();
    TestBed.configureTestingModule({
      providers: [
        GlobalErrorHandler,
        { provide: ErrorHandlerService, useValue: errorHandlerService },
      ],
    });
    errorHandler = TestBed.inject(GlobalErrorHandler);
    vi.clearAllMocks();
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
