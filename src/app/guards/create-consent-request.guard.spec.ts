import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';
import type { Mock } from 'vitest';

import { CreateConsentRequestGuard } from '@/app/guards/create-consent-request.guard';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { CreateConsentRequestDto, UidDto } from '@/entities/openapi';
import { ConsentRequestCreatedDto } from '@/entities/openapi/model/consentRequestCreatedDto';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ExternalServiceHttpError } from '@/shared/error/external-service-http-error';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAuthService,
  MockAuthService,
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockConsentRequestService,
  MockConsentRequestService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';

import { ProducerUidGuard } from './producer-uid.guard';

describe('createConsentRequestGuard', () => {
  let createConsentRequestGuard: CreateConsentRequestGuard;
  let consentRequestService: MockConsentRequestService;
  let authService: MockAuthService;
  let errorService: MockErrorHandlerService;
  const testUid = '123';
  const testDataRequestId = 'test-data-request';
  const testConsentRequestId = 'test-consent-request-id';

  const mockUrlTree = { toString: () => 'mock-url' } as UrlTree;
  const mockErrorUrlTree = { toString: () => 'error-url' } as UrlTree;

  let mockRouter: {
    createUrlTree: Mock;
    parseUrl: Mock;
    navigate: Mock;
  };

  let mockProducerUidGuard: {
    canActivate: Mock;
  };

  let agridataStateService: MockAgridataStateService;

  beforeEach(() => {
    authService = createMockAuthService();
    authService.initializeAuthorizedUids.mockResolvedValue([{ uid: testUid } as UidDto]);
    errorService = createMockErrorHandlerService();
    mockRouter = {
      createUrlTree: vi.fn().mockReturnValue(mockUrlTree),
      parseUrl: vi.fn().mockReturnValue(mockErrorUrlTree),
      navigate: vi.fn(),
    };

    mockProducerUidGuard = {
      canActivate: vi.fn().mockResolvedValue(true),
    };
    consentRequestService = createMockConsentRequestService();

    agridataStateService = createMockAgridataStateService();

    TestBed.configureTestingModule({
      providers: [
        CreateConsentRequestGuard,
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: AuthService, useValue: authService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: ProducerUidGuard, useValue: mockProducerUidGuard },
        { provide: Router, useValue: mockRouter },
      ],
    });

    createConsentRequestGuard = TestBed.inject(CreateConsentRequestGuard);
  });

  it('should be created', () => {
    expect(createConsentRequestGuard).toBeTruthy();
  });

  it('should redirect to error page when no dataRequestId is provided', async () => {
    const route = {
      paramMap: convertToParamMap({}),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    const result = await createConsentRequestGuard.canActivate(route);

    expect(result).toBe(mockErrorUrlTree);
  });

  it('should redirect to error page when no consent requests are created', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    consentRequestService.createConsentRequests.mockReturnValue(of([]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestId },
    ];

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should create multiple consent requests and redirect to consent request matching active uid', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    const firstUidDto: UidDto = { uid: '1' };
    const userUids: UidDto[] = [firstUidDto, { uid: '2' }];
    authService.initializeAuthorizedUids.mockResolvedValue(userUids);

    agridataStateService.__testSignals.activeUid.set(firstUidDto.uid);

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: firstUidDto.uid,
    };
    const expectedCreateDto: CreateConsentRequestDto[] = userUids.map((uidDto) => {
      return { uid: uidDto.uid, dataRequestId: testDataRequestId };
    });

    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, firstUidDto.uid, testDataRequestId],
      { queryParams: {} },
    );
    expect(result).toBe(mockUrlTree);
  });

  it('when uid parameter set, should create single consent requests and redirect to it', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({ uid: '1' }),
    } as ActivatedRouteSnapshot;

    const firstUidDto: UidDto = { uid: '1' };
    const userUids: UidDto[] = [firstUidDto, { uid: '2' }];

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: firstUidDto.uid,
    };
    authService.initializeAuthorizedUids.mockResolvedValue(userUids);

    agridataStateService.__testSignals.activeUid.set(firstUidDto.uid);

    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: firstUidDto.uid, dataRequestId: testDataRequestId },
    ];

    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, firstUidDto.uid, testDataRequestId],
      { queryParams: {} },
    );
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to specific consent request page when a matching consent request is found with a redirectUrl', async () => {
    const testRedirectUri = 'https://example.com/redirect';
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({ redirect_uri: testRedirectUri }),
    } as ActivatedRouteSnapshot;

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestId },
    ];
    agridataStateService.__testSignals.activeUid.set(testUid);

    await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, testUid, testDataRequestId],
      { queryParams: { redirect_uri: testRedirectUri } },
    );
  });

  it('should set active uid when a valid uid is provided in query parameters', async () => {
    const validUid = '123'; // Valid UID from mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({ uid: validUid }),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: validUid,
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestId },
    ];
    authService.initializeAuthorizedUids.mockResolvedValue([{ uid: validUid } as UidDto]);

    agridataStateService.__testSignals.activeUid.set(validUid);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(validUid);
    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, validUid, testDataRequestId],
      { queryParams: {} },
    );
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to error page when an invalid uid is provided', async () => {
    const invalidUid = 'invalid-uid'; // This uid does not exist in mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({ uid: invalidUid }),
    } as ActivatedRouteSnapshot;

    authService.initializeAuthorizedUids.mockResolvedValue([
      { uid: '1' } as UidDto,
      { uid: '2' } as UidDto,
      { uid: testUid } as UidDto,
    ]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
    // Verify that setActiveUid was not called with the invalid uid
    expect(agridataStateService.setActiveUid).not.toHaveBeenCalledWith(invalidUid);
  });

  it('should redirect to error page when createConsentRequests throws an error', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const testError = new Error('Test error');
    consentRequestService.createConsentRequests.mockReturnValue(throwError(() => testError));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestId },
    ];

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should redirect to consent request when no activeUid is set but consent requests exist', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    agridataStateService.__testSignals.activeUid.set(undefined);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(testUid);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, testUid, testDataRequestId],
      { queryParams: {} },
    );
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to external service error page when ExternalServiceHttpError is thrown', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    authService.initializeAuthorizedUids.mockRejectedValueOnce(new ExternalServiceHttpError());

    const result = await createConsentRequestGuard.canActivate(route);

    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([ROUTE_PATHS.EXTERNAL_SERVICE_ERROR]);
    expect(result).toBe(mockUrlTree);
  });

  describe('404 error handling with redirect', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should navigate to producer page with redirect_uri query param on 404 error', async () => {
      const testRedirectUri = 'https://example.com/callback';
      const route = {
        paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
        queryParamMap: convertToParamMap({ redirect_uri: testRedirectUri }),
      } as ActivatedRouteSnapshot;

      const httpError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      consentRequestService.createConsentRequests.mockReturnValue(throwError(() => httpError));
      agridataStateService.__testSignals.activeUid.set(testUid);

      const result = await createConsentRequestGuard.canActivate(route);

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, testUid],
        { queryParams: { redirect_uri: testRedirectUri } },
      );
      expect(result).toBe(mockUrlTree);
    });

    it('should navigate to producer page without query params when no redirect_uri on 404 error', async () => {
      const route = {
        paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
        queryParamMap: convertToParamMap({}),
      } as ActivatedRouteSnapshot;

      const httpError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });
      consentRequestService.createConsentRequests.mockReturnValue(throwError(() => httpError));
      agridataStateService.__testSignals.activeUid.set(testUid);

      const result = await createConsentRequestGuard.canActivate(route);

      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, testUid],
        { queryParams: {} },
      );
      expect(result).toBe(mockUrlTree);
    });

    it('should handle error with custom title and message after setTimeout on 404', async () => {
      const route = {
        paramMap: convertToParamMap({ dataRequestId: testDataRequestId }),
        queryParamMap: convertToParamMap({}),
      } as ActivatedRouteSnapshot;

      const httpError = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
        error: { message: 'Data request not found' },
      });
      consentRequestService.createConsentRequests.mockReturnValue(throwError(() => httpError));
      agridataStateService.__testSignals.activeUid.set(testUid);

      await createConsentRequestGuard.canActivate(route);

      expect(errorService.handleError).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);

      expect(errorService.handleError).toHaveBeenCalledWith(
        expect.any(Error),
        { i18n: 'errors.consentRequest.notFound.message' },
        { i18n: 'errors.consentRequest.notFound.title' },
      );
    });
  });
});
