import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';
import { of, throwError } from 'rxjs';

import { CreateConsentRequestGuard } from '@/app/guards/create-consent-request.guard';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { CreateConsentRequestDto, UidDto } from '@/entities/openapi';
import { ConsentRequestCreatedDto } from '@/entities/openapi/model/consentRequestCreatedDto';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import {
  createMockConsentRequestService,
  MockConsentRequestService,
} from '@/shared/testing/mocks/mock-consent-request-service';

import { ProducerUidGuard } from './producer-uid.guard';

describe('createConsentRequestGuard', () => {
  let createConsentRequestGuard: CreateConsentRequestGuard;
  let consentRequestService: MockConsentRequestService;
  let authService: MockAuthService;
  const testUid = '123';
  const testDataRequestUid = 'test-data-request';
  const testConsentRequestId = 'test-consent-request-id';

  const mockUrlTree = { toString: () => 'mock-url' } as UrlTree;
  const mockErrorUrlTree = { toString: () => 'error-url' } as UrlTree;

  let mockRouter: {
    createUrlTree: jest.Mock;
    parseUrl: jest.Mock;
    navigate: jest.Mock;
  };

  let mockProducerUidGuard: {
    canActivate: jest.Mock;
  };

  let agridataStateService: MockAgridataStateService;

  beforeEach(() => {
    authService = createMockAuthService();
    authService.initializeAuthorizedUids.mockReturnValue(of([{ uid: testUid } as UidDto]));
    mockRouter = {
      createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
      parseUrl: jest.fn().mockReturnValue(mockErrorUrlTree),
      navigate: jest.fn(),
    };

    mockProducerUidGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    };
    consentRequestService = createMockConsentRequestService();

    agridataStateService = createMockAgridataStateService();

    TestBed.configureTestingModule({
      providers: [
        CreateConsentRequestGuard,
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: AuthService, useValue: authService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: ProducerUidGuard, useValue: mockProducerUidGuard },
        { provide: Router, useValue: mockRouter },
      ],
    });

    createConsentRequestGuard = TestBed.inject(CreateConsentRequestGuard);
  });

  it('should be created', () => {
    expect(createConsentRequestGuard).toBeTruthy();
  });

  it('should redirect to error page when no dataRequestUid is provided', (done) => {
    const route = {
      paramMap: convertToParamMap({}),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(result).toBe(mockErrorUrlTree);
      done();
    });
  });

  it('should redirect to error page when no consent requests are created', (done) => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    consentRequestService.createConsentRequests.mockReturnValue(of([]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
      expect(result).toBe(mockErrorUrlTree);
      done();
    });
  });

  it('should create multiple consent requests and redirect to consent request matching active uid', (done) => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    const firstUidDto: UidDto = { uid: '1' };
    const userUids: UidDto[] = [firstUidDto, { uid: '2' }];
    authService.initializeAuthorizedUids.mockReturnValue(of(userUids));

    agridataStateService.__testSignals.activeUid.set(firstUidDto.uid);

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: firstUidDto.uid,
    };
    const expectedCreateDto: CreateConsentRequestDto[] = userUids.map((uidDto) => {
      return { uid: uidDto.uid, dataRequestId: testDataRequestUid };
    });

    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, firstUidDto.uid, testConsentRequestId],
        { queryParams: {} },
      );
      expect(result).toBe(mockUrlTree);
      done();
    });
  });

  it('when uid parameter set, should create single consent requests and redirect to it', (done) => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ uid: '1' }),
    } as ActivatedRouteSnapshot;

    const firstUidDto: UidDto = { uid: '1' };
    const userUids: UidDto[] = [firstUidDto, { uid: '2' }];

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: firstUidDto.uid,
    };
    authService.initializeAuthorizedUids.mockReturnValue(of(userUids));

    agridataStateService.__testSignals.activeUid.set(firstUidDto.uid);

    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: firstUidDto.uid, dataRequestId: testDataRequestUid },
    ];

    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, firstUidDto.uid, testConsentRequestId],
        { queryParams: {} },
      );
      expect(result).toBe(mockUrlTree);
      done();
    });
  });

  it('should redirect to specific consent request page when a matching consent request is found with a redirectUrl', (done) => {
    const testRedirectUri = 'https://example.com/redirect';
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ redirect_uri: testRedirectUri }),
    } as ActivatedRouteSnapshot;

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    agridataStateService.__testSignals.activeUid.set(testUid);

    createConsentRequestGuard.canActivate(route).subscribe(() => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, testUid, testConsentRequestId],
        { queryParams: { redirect_uri: testRedirectUri } },
      );
      done();
    });
  });

  it('should redirect to consent requests overview when no matching consent request is found', (done) => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: 'different-uid', // Different from active UID
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
        ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      ]);
      expect(result).toBe(mockUrlTree);
      done();
    });
  });

  it('should set active uid when a valid uid is provided in query parameters', (done) => {
    const validUid = '123'; // Valid UID from mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ uid: validUid }),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: validUid,
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    authService.initializeAuthorizedUids.mockReturnValue(of([{ uid: validUid } as UidDto]));

    agridataStateService.__testSignals.activeUid.set(validUid);

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(validUid);
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(
        [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, validUid, testConsentRequestId],
        { queryParams: {} },
      );
      expect(result).toBe(mockUrlTree);
      done();
    });
  });

  it('should redirect to error page when an invalid uid is provided', (done) => {
    const invalidUid = 'invalid-uid'; // This uid does not exist in mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ uid: invalidUid }),
    } as ActivatedRouteSnapshot;

    authService.initializeAuthorizedUids.mockReturnValue(
      of([{ uid: '1' } as UidDto, { uid: '2' } as UidDto, { uid: testUid } as UidDto]),
    );

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
      expect(result).toBe(mockErrorUrlTree);
      // Verify that setActiveUid was not called with the invalid uid
      expect(agridataStateService.setActiveUid).not.toHaveBeenCalledWith(invalidUid);
      done();
    });
  });

  it('should redirect to error page when createConsentRequests throws an error', (done) => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const testError = new Error('Test error');
    consentRequestService.createConsentRequests.mockReturnValue(throwError(() => testError));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
      expect(result).toBe(mockErrorUrlTree);
      done();
    });
  });

  it('should redirect to consent requests overview when no activeUid is set', (done) => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    consentRequestService.createConsentRequests.mockReturnValue(of([mockConsentRequest]));
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    agridataStateService.__testSignals.activeUid.set(undefined);

    createConsentRequestGuard.canActivate(route).subscribe((result) => {
      expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
        ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      ]);
      expect(result).toBe(mockUrlTree);
      done();
    });
  });
});
