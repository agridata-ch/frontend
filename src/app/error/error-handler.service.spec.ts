import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { enhanceHttpErrorWithMethod } from '@/app/interceptors/error-http-interceptor';
import { ExceptionDto, ExceptionEnum } from '@/entities/openapi';

import { TranslationItem } from './error-dto';
import { ErrorHandlerService, ErrorWithCause, ResourceValueError } from './error-handler.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorHandlerService);
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with global handler', () => {
    const handlerIds = service.getHandlerIds();
    expect(handlerIds).toContain('global');
    expect(handlerIds).toHaveLength(1);
  });

  describe('handleError', () => {
    it('should handle frontend error correctly', () => {
      const error = new Error('Test frontend error');
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorDto = service.handleError(error);

      expect(errorDto.isFrontendError).toBe(true);
      expect(errorDto.originalError).toBe(error);
      expect(errorDto.i18nTitle.i18n).toBe('errors.frontend.unexpected.title');
      expect(errorDto.i18nReason.i18n).toBe('errors.frontend.unexpected.details');
      expect(errorDto.i18nReason.i18nParameter?.['errorDetails']).toBe('Test frontend error');
      expect(errorDto.isHandled).toBe(false);
      expect(errorDto.timestamp).toBeInstanceOf(Date);
      expect(consoleErrorSpy).toHaveBeenCalledWith(error);

      consoleErrorSpy.mockRestore();
    });

    it('should handle HTTP error correctly', () => {
      const httpError = enhanceHttpErrorWithMethod(
        new HttpErrorResponse({
          error: null,
          headers: undefined,
          status: 404,
          statusText: 'Not Found',
          url: 'http://localhost:8060/api/agreement/v1/consent-requests',
        }),
        'GET',
      );

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorDto = service.handleError(httpError);

      expect(errorDto.isFrontendError).toBe(false);
      expect(errorDto.originalError).toBe(httpError);
      expect(errorDto.i18nTitle.i18n).toBe('errors.backend.method.get');
      expect(errorDto.i18nReason.i18n).toBe('errors.backend.notFound');
      expect(errorDto.i18nReason.i18nParameter?.['status']).toBe('404');
      expect(errorDto.url).toBe('http://localhost:8060/api/agreement/v1/consent-requests');
      expect(errorDto.i18nPath?.i18n).toBe('errors.backend.path');
      expect(errorDto.i18nPath?.i18nParameter?.['path']).toBe('agreement/consent-requests');
      expect(consoleErrorSpy).toHaveBeenCalledWith(httpError);

      consoleErrorSpy.mockRestore();
    });

    it('should handle HTTP error with backend exception', () => {
      const exceptionDto: ExceptionDto = {
        requestId: 'test-request-id-123',
        message: 'Backend error',
        type: ExceptionEnum.Generic,
      };
      const httpError = new HttpErrorResponse({
        error: exceptionDto,
        headers: undefined,
        status: 500,
        statusText: 'Internal Server Error',
        url: 'http://localhost:8060/api/test/v1/endpoint',
      });

      const errorDto = service.handleError(httpError);

      expect(errorDto.i18nErrorId?.i18n).toBe('errors.backend.errorId');
      expect(errorDto.i18nErrorId?.i18nParameter?.['errorId']).toBe('test-request-id-123');
    });

    it('should handle custom reason', () => {
      const error = new Error('Test error');
      const customReason: TranslationItem = { i18n: 'custom.error.message' };

      const errorDto = service.handleError(error, customReason);

      expect(errorDto.i18nReason).toBe(customReason);
    });

    it('should handle ResourceValueError', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 400,
        statusText: 'Bad Request',
      });
      const errorWithCause: ErrorWithCause = {
        name: 'ErrorWithCause',
        message: 'Error with cause',
        cause: httpError,
      };
      const resourceError: ResourceValueError = {
        name: 'ResourceValueError',
        message: 'Resource error',
        cause: errorWithCause,
      };

      const errorDto = service.handleError(resourceError);

      expect(errorDto.originalError).toBe(httpError);
      expect(errorDto.isFrontendError).toBe(false);
    });

    it('should handle ErrorWithCause', () => {
      const httpError = new HttpErrorResponse({
        error: null,
        status: 401,
        statusText: 'Unauthorized',
      });
      const errorWithCause: ErrorWithCause = {
        name: 'ErrorWithCause',
        message: 'Error with cause',
        cause: httpError,
      };

      const errorDto = service.handleError(errorWithCause);

      expect(errorDto.originalError).toBe(httpError);
      expect(errorDto.isFrontendError).toBe(false);
    });
  });

  describe('handler registration and management', () => {
    it('should register new handler', () => {
      const handlerId = service.registerHandler();

      expect(handlerId).toMatch(
        /^handler-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
      expect(service.getHandlerIds()).toContain(handlerId);
    });

    it('should unregister handler', () => {
      const handlerId = service.registerHandler();

      service.unregisterHandler(handlerId);

      expect(service.getHandlerIds()).not.toContain(handlerId);
    });

    it('should route errors to most recent handler', () => {
      const handler1 = service.registerHandler();
      const handler2 = service.registerHandler();

      const error = new Error('Test error');
      service.handleError(error);

      const handler1Errors = service.getErrorsForHandler(handler1);
      const handler2Errors = service.getErrorsForHandler(handler2);

      expect(handler1Errors()).toHaveLength(0);
      expect(handler2Errors()).toHaveLength(1);
    });

    it('should route errors to global when no local handlers', () => {
      const error = new Error('Test error');
      service.handleError(error);

      const globalErrors = service.getGlobalErrors();
      expect(globalErrors()).toHaveLength(1);
    });
  });

  describe('error marking and cleanup', () => {
    it('should mark all errors of handler as handled', () => {
      const handlerId = service.registerHandler();
      const error = new Error('Test error');
      service.handleError(error);

      service.markAllErrorsOfHandlerAsHandled(handlerId);

      const handlerErrors = service.getErrorsForHandler(handlerId);
      const allErrors = service.getAllErrors();

      expect(handlerErrors()).toHaveLength(0);
      expect(allErrors()[0].isHandled).toBe(true);
    });

    it('should mark all global errors as handled', () => {
      const error = new Error('Test error');
      service.handleError(error);

      service.markAllGlobalAsHandled();

      const globalErrors = service.getGlobalErrors();
      expect(globalErrors()).toHaveLength(0);
    });

    it('should mark all errors as handled', () => {
      const handler1 = service.registerHandler();
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      service.handleError(error1);
      service.unregisterHandler(handler1);
      service.handleError(error2);

      service.markAllAsHandled();

      const globalErrors = service.getGlobalErrors();
      const allErrors = service.getAllErrors();

      expect(globalErrors()).toHaveLength(0);
      expect(allErrors()).toHaveLength(2);
      expect(allErrors().every((e) => e.isHandled)).toBe(true);
    });

    it('should handle non-existent handler gracefully', () => {
      expect(() => {
        service.markAllErrorsOfHandlerAsHandled('non-existent');
      }).not.toThrow();
    });
  });

  describe('error queue management', () => {
    it('should return empty signal for non-existent handler', () => {
      const errors = service.getErrorsForHandler('non-existent');
      expect(errors()).toHaveLength(0);
    });

    it('should track all errors', () => {
      const error1 = new Error('Error 1');
      const error2 = new Error('Error 2');

      service.handleError(error1);
      service.handleError(error2);

      const allErrors = service.getAllErrors();
      expect(allErrors()).toHaveLength(2);
    });
  });

  describe('cleanup interval', () => {
    it('should remove old errors when limit exceeded', () => {
      // Add 12 errors to exceed the 10 error limit
      for (let i = 0; i < 12; i++) {
        service.handleError(new Error(`Error ${i}`));
      }
      service['removeOldErrors']();

      const allErrors = service.getAllErrors();
      expect(allErrors()).toHaveLength(10);
    });

    it('should not remove errors when under limit', () => {
      for (let i = 0; i < 5; i++) {
        service.handleError(new Error(`Error ${i}`));
      }

      jest.advanceTimersByTime(60000);

      const allErrors = service.getAllErrors();
      expect(allErrors()).toHaveLength(5);
    });
  });

  describe('HTTP status code mapping', () => {
    const statusTests = [
      { status: 400, expected: 'errors.backend.badRequest' },
      { status: 401, expected: 'errors.backend.unauthorized' },
      { status: 403, expected: 'errors.backend.forbidden' },
      { status: 404, expected: 'errors.backend.notFound' },
      { status: 500, expected: 'errors.backend.internalServerError' },
      { status: 502, expected: 'errors.backend.serviceUnavailable' },
      { status: 503, expected: 'errors.backend.serviceUnavailable' },
      { status: 418, expected: 'errors.backend.unexpected' },
    ];

    statusTests.forEach(({ status, expected }) => {
      it(`should map status ${status} to ${expected}`, () => {
        const httpError = new HttpErrorResponse({ status });
        const errorDto = service.handleError(httpError);
        expect(errorDto.i18nReason.i18n).toBe(expected);
      });
    });
  });

  describe('HTTP method mapping', () => {
    const methodTests = [
      { method: 'GET', expected: 'errors.backend.method.get' },
      { method: 'POST', expected: 'errors.backend.method.post' },
      { method: 'PUT', expected: 'errors.backend.method.put' },
      { method: 'DELETE', expected: 'errors.backend.method.delete' },
      { method: 'PATCH', expected: 'errors.backend.method.patch' },
      { method: 'OPTIONS', expected: 'errors.backend.generic.title' },
      { method: undefined, expected: 'errors.backend.generic.title' },
    ];

    methodTests.forEach(({ method, expected }) => {
      it(`should map method ${method || 'undefined'} to ${expected}`, () => {
        // Mock getErrorMethod to return our test method
        const mockGetErrorMethod = jest.fn().mockReturnValue(method);
        jest.doMock('@/app/interceptors/error-http-interceptor', () => ({
          getErrorMethod: mockGetErrorMethod,
        }));

        const titleKey = service['get18nMessageByMethod'](method);

        expect(titleKey).toBe(expected);
      });
    });
  });

  describe('URL path extraction', () => {
    it('should extract API path correctly', () => {
      const testCases = [
        {
          url: 'http://localhost:8060/api/agreement/v1/consent-requests?param=value',
          expected: 'agreement/consent-requests',
        },
        {
          url: 'http://localhost:8060/api/user/v2/profile/settings',
          expected: 'user/profile/settings',
        },
        {
          url: 'http://localhost:8060/api/data/v1/products',
          expected: 'data/products',
        },
        {
          url: 'http://localhost:8060/other/path',
          expected: 'http://localhost:8060/other/path',
        },
        {
          url: 'invalid-url',
          expected: 'invalid-url',
        },
      ];

      testCases.forEach(({ url, expected }) => {
        const result = service['extractApiPath'](url);
        expect(result).toBe(expected);
      });
    });
  });
});
