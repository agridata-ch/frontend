import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ExceptionDto, ExceptionEnum } from '@/entities/openapi';
import { DebugService } from '@/features/debug/debug.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { DummyComponent } from '@/shared/testing/mocks/dummy-components';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';

import {
  enhanceHttpErrorWithMethod,
  errorHttpInterceptor,
  getErrorMethod,
  hasMethod,
  HttpErrorWithMethod,
  METHOD_ENHANCED,
} from './error-http-interceptor';

const mockDebugService: Partial<DebugService> = {
  addRequest: jest.fn(),
  addResponse: jest.fn(),
};

const createMockAuthService = () =>
  ({
    isAuthenticated: signal<boolean>(false),
  }) satisfies Partial<AuthService>;

describe('errorHttpInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;
  let debugService: Partial<DebugService>;
  let authService: ReturnType<typeof createMockAuthService>;
  let agridataStateService: MockAgridataStateService;
  let router: Router;

  beforeEach(() => {
    debugService = { ...mockDebugService };
    authService = createMockAuthService();
    agridataStateService = createMockAgridataStateService();

    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: ROUTE_PATHS.MAINTENANCE, component: DummyComponent },
          { path: '', component: DummyComponent },
          { path: ROUTE_PATHS.PRIVACY_POLICY_PATH, component: DummyComponent },
        ]),
        provideHttpClient(withInterceptors([errorHttpInterceptor])),
        provideHttpClientTesting(),
        { provide: DebugService, useValue: debugService },
        { provide: AuthService, useValue: authService },
        { provide: AgridataStateService, useValue: agridataStateService },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    jest.clearAllMocks();
  });

  it('should track successful requests and responses', (done) => {
    const testUrl = '/api/test';

    httpClient.get(testUrl).subscribe({
      next: () => {
        expect(debugService.addRequest).toHaveBeenCalledWith(testUrl, 'GET');
        expect(debugService.addResponse).toHaveBeenCalledWith(testUrl, 'GET', 200, 'OK', false);
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ data: 'test' });
  });

  it('should track failed requests and responses with error status', (done) => {
    const testUrl = '/api/error';
    const errorStatus = 500;
    const errorStatusText = 'Internal Server Error';

    httpClient.get(testUrl).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(debugService.addRequest).toHaveBeenCalledWith(testUrl, 'GET');
        expect(debugService.addResponse).toHaveBeenCalledWith(
          testUrl,
          'GET',
          errorStatus,
          errorStatusText,
          true,
          undefined,
        );
        expect(error.status).toBe(errorStatus);
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: errorStatus, statusText: errorStatusText });
  });

  it('should enhance error with HTTP method', (done) => {
    const testUrl = '/api/error';

    httpClient.post(testUrl, {}).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(hasMethod(error)).toBe(true);
        if (hasMethod(error)) {
          expect(error.method).toBe('POST');
        }
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 404, statusText: 'Not Found' });
  });

  it('should extract requestId from backend ExceptionDto error', (done) => {
    const testUrl = '/api/error';
    const requestId = 'test-request-id-123';
    const backendError: ExceptionDto = {
      requestId,
      message: 'Test error message',
    };

    httpClient.get(testUrl).subscribe({
      error: () => {
        expect(debugService.addResponse).toHaveBeenCalledWith(
          testUrl,
          'GET',
          400,
          'Bad Request',
          true,
          requestId,
        );
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(backendError, { status: 400, statusText: 'Bad Request' });
  });

  it('should handle error without requestId gracefully', (done) => {
    const testUrl = '/api/error';

    httpClient.get(testUrl).subscribe({
      error: () => {
        expect(debugService.addResponse).toHaveBeenCalledWith(
          testUrl,
          'GET',
          403,
          'Forbidden',
          true,
          undefined,
        );
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush({ someOtherError: 'data' }, { status: 403, statusText: 'Forbidden' });
  });

  it('should handle different HTTP methods correctly', (done) => {
    const testUrl = '/api/resource';

    httpClient.delete(testUrl).subscribe({
      error: (error: HttpErrorResponse) => {
        expect(debugService.addRequest).toHaveBeenCalledWith(testUrl, 'DELETE');
        if (hasMethod(error)) {
          expect(error.method).toBe('DELETE');
        }
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 404, statusText: 'Not Found' });
  });

  it('should handle error without statusText', (done) => {
    const testUrl = '/api/error';

    httpClient.get(testUrl).subscribe({
      error: () => {
        expect(debugService.addResponse).toHaveBeenCalledWith(
          testUrl,
          'GET',
          500,
          'Unknown Error',
          true,
          undefined,
        );
        done();
      },
    });

    const req = httpMock.expectOne(testUrl);
    req.flush(null, { status: 500, statusText: '' });
  });

  it('should track multiple requests independently', (done) => {
    const url1 = '/api/first';
    const url2 = '/api/second';
    let completedRequests = 0;

    const checkCompletion = () => {
      completedRequests++;
      if (completedRequests === 2) {
        expect(debugService.addRequest).toHaveBeenCalledTimes(2);
        expect(debugService.addResponse).toHaveBeenCalledTimes(2);
        expect(debugService.addRequest).toHaveBeenCalledWith(url1, 'GET');
        expect(debugService.addRequest).toHaveBeenCalledWith(url2, 'POST');
        done();
      }
    };

    httpClient.get(url1).subscribe({
      next: checkCompletion,
    });

    httpClient.post(url2, {}).subscribe({
      next: checkCompletion,
    });

    const req1 = httpMock.expectOne(url1);
    req1.flush({});

    const req2 = httpMock.expectOne(url2);
    req2.flush({});
  });

  describe('maintenance navigation', () => {
    it('should navigate to maintenance and return 204 when maintenance error occurs for authenticated user', (done) => {
      const testUrl = '/api/test';
      const maintenanceError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Maintenance,
        message: 'System is under maintenance',
      };

      authService.isAuthenticated.set(true);
      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.MAINTENANCE]);
          done();
        },
        error: () => {
          done.fail('Should not throw error when navigating to maintenance');
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(maintenanceError, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should not navigate to maintenance when user is not authenticated', (done) => {
      const testUrl = '/api/test';
      const maintenanceError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Maintenance,
        message: 'System is under maintenance',
      };

      authService.isAuthenticated.set(false);
      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(503);
          expect(navigateSpy).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(maintenanceError, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should not navigate to maintenance when current route is in blacklist (home page)', (done) => {
      const testUrl = '/api/test';
      const maintenanceError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Maintenance,
        message: 'System is under maintenance',
      };

      authService.isAuthenticated.set(true);
      agridataStateService.__testSignals.currentRouteWithoutQueryParams.set(`/`);
      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(503);
          expect(navigateSpy).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(maintenanceError, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should not navigate to maintenance when current route is privacy policy', (done) => {
      const testUrl = '/api/test';
      const maintenanceError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Maintenance,
        message: 'System is under maintenance',
      };

      authService.isAuthenticated.set(true);
      agridataStateService.__testSignals.currentRouteWithoutQueryParams.set(
        `/${ROUTE_PATHS.PRIVACY_POLICY_PATH}`,
      );

      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(503);
          expect(navigateSpy).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(maintenanceError, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should not navigate to maintenance when current route is already maintenance page', (done) => {
      const testUrl = '/api/test';
      const maintenanceError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Maintenance,
        message: 'System is under maintenance',
      };

      authService.isAuthenticated.set(true);
      agridataStateService.__testSignals.currentRouteWithoutQueryParams.set(
        `/${ROUTE_PATHS.MAINTENANCE}`,
      );

      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(503);
          expect(navigateSpy).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(maintenanceError, { status: 503, statusText: 'Service Unavailable' });
    });

    it('should not navigate to maintenance when error is not maintenance type', (done) => {
      const testUrl = '/api/test';
      const otherError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Generic,
        message: 'Resource not found',
      };

      authService.isAuthenticated.set(true);

      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(navigateSpy).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(otherError, { status: 404, statusText: 'Not Found' });
    });

    it('should not navigate to maintenance when error is not ExceptionDto', (done) => {
      const testUrl = '/api/test';
      const plainError = { error: 'Something went wrong' };

      authService.isAuthenticated.set(true);

      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(500);
          expect(navigateSpy).not.toHaveBeenCalled();
          done();
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(plainError, { status: 500, statusText: 'Internal Server Error' });
    });

    it('should handle null currentRoute gracefully', (done) => {
      const testUrl = '/api/test';
      const maintenanceError: ExceptionDto = {
        requestId: 'test-request-id',
        type: ExceptionEnum.Maintenance,
        message: 'System is under maintenance',
      };

      authService.isAuthenticated.set(true);
      agridataStateService.__testSignals.currentRouteWithoutQueryParams.set(undefined);
      const navigateSpy = jest.spyOn(router, 'navigate');

      httpClient.get(testUrl).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.MAINTENANCE]);
          done();
        },
        error: () => {
          done.fail('Should not throw error when navigating to maintenance');
        },
      });

      const req = httpMock.expectOne(testUrl);
      req.flush(maintenanceError, { status: 503, statusText: 'Service Unavailable' });
    });
  });
});

describe('enhanceHttpErrorWithMethod', () => {
  it('should enhance error with method property', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    const enhanced = enhanceHttpErrorWithMethod(error, 'GET');

    expect(hasMethod(enhanced)).toBe(true);
    expect(enhanced.method).toBe('GET');
    expect(enhanced[METHOD_ENHANCED]).toBe(true);
  });

  it('should not enhance already enhanced error', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    const enhanced = enhanceHttpErrorWithMethod(error, 'GET');
    const reEnhanced = enhanceHttpErrorWithMethod(enhanced, 'POST');

    expect(reEnhanced.method).toBe('GET'); // Should keep original method
  });

  it('should make method property non-writable', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    const enhanced = enhanceHttpErrorWithMethod(error, 'GET');

    expect(() => {
      (enhanced as HttpErrorWithMethod).method = 'POST';
    }).toThrow();
  });

  it('should make METHOD_ENHANCED symbol non-enumerable', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    const enhanced = enhanceHttpErrorWithMethod(error, 'GET');
    const keys = Object.keys(enhanced);

    expect(keys.includes('method')).toBe(true);
    expect(keys.includes(METHOD_ENHANCED.toString())).toBe(false);
  });
});

describe('hasMethod', () => {
  it('should return true for enhanced error', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    const enhanced = enhanceHttpErrorWithMethod(error, 'GET');

    expect(hasMethod(enhanced)).toBe(true);
  });

  it('should return false for non-enhanced error', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    expect(hasMethod(error)).toBe(false);
  });

  it('should return false for non-HttpErrorResponse', () => {
    const error = new Error('test error');

    expect(hasMethod(error)).toBe(false);
  });

  it('should return false for null', () => {
    expect(hasMethod(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(hasMethod(undefined)).toBe(false);
  });
});

describe('getErrorMethod', () => {
  it('should return method from enhanced error', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    const enhanced = enhanceHttpErrorWithMethod(error, 'GET');

    expect(getErrorMethod(enhanced)).toBe('GET');
  });

  it('should return undefined for non-enhanced error', () => {
    const error = new HttpErrorResponse({
      error: 'test error',
      status: 404,
      statusText: 'Not Found',
      url: '/api/test',
    });

    expect(getErrorMethod(error)).toBeUndefined();
  });
});
