import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, convertToParamMap, Router, UrlTree } from '@angular/router';

import { CreateConsentRequestGuard } from '@/app/guards/create-consent-request.guard';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { CreateConsentRequestDto, UidDto } from '@/entities/openapi';
import { ConsentRequestCreatedDto } from '@/entities/openapi/model/consentRequestCreatedDto';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { mockConsentRequestService, mockUserService } from '@/shared/testing/mocks';
import { mockAgridataStateService } from '@/shared/testing/mocks/mock-agridata-state.service';

import { ProducerUidGuard } from './producer-uid.guard';

describe('createConsentRequestGuard', () => {
  let createConsentRequestGuard: CreateConsentRequestGuard;
  let consentRequestService: typeof mockConsentRequestService;

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

  let agridataStateService: ReturnType<typeof mockAgridataStateService>;

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
      parseUrl: jest.fn().mockReturnValue(mockErrorUrlTree),
      navigate: jest.fn(),
    };

    mockProducerUidGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    };
    consentRequestService = mockConsentRequestService;

    agridataStateService = mockAgridataStateService(testUid);

    TestBed.configureTestingModule({
      providers: [
        CreateConsentRequestGuard,
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: UserService, useValue: mockUserService },
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

  it('should redirect to error page when no dataRequestUid is provided', async () => {
    const route = {
      paramMap: convertToParamMap({}),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    const result = await createConsentRequestGuard.canActivate(route);

    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should redirect to error page when no consent requests are created', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    consentRequestService.createConsentRequests.mockResolvedValue([]);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should create multiple consent requests and redirect to consent request matching active uid', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;

    const firstUidDto: UidDto = { uid: '1' };
    const userUids: UidDto[] = [firstUidDto, { uid: '2' }];

    jest.spyOn(agridataStateService, 'userUidsLoaded').mockReturnValue(true);
    jest.spyOn(agridataStateService, 'userUids').mockReturnValue(userUids);
    agridataStateService.activeUid.set(firstUidDto.uid);

    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: firstUidDto.uid,
    };
    const expectedCreateDto: CreateConsentRequestDto[] = userUids.map((uidDto) => {
      return { uid: uidDto.uid, dataRequestId: testDataRequestUid };
    });

    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      firstUidDto.uid,
      testConsentRequestId,
    ]);
    expect(result).toBe(mockUrlTree);
  });

  it('when uid parameter set, should create single consent requests and redirect to it', async () => {
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

    jest.spyOn(agridataStateService, 'userUidsLoaded').mockReturnValue(true);
    jest.spyOn(agridataStateService, 'userUids').mockReturnValue(userUids);
    agridataStateService.activeUid.set(firstUidDto.uid);

    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: firstUidDto.uid, dataRequestId: testDataRequestUid },
    ];

    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      firstUidDto.uid,
      testConsentRequestId,
    ]);
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to specific consent request page when a matching consent request is found with a redirectUrl', async () => {
    const testRedirectUri = 'https://example.com/redirect';
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ redirect_uri: testRedirectUri }),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.navigate).toHaveBeenCalledWith(
      [ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, testUid, testConsentRequestId],
      { state: { redirect_uri: testRedirectUri } },
    );
    expect(result).toBe(false);
  });

  it('should redirect to consent requests overview when no matching consent request is found', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: 'different-uid', // Different from active UID
    };
    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
    ]);
    expect(result).toBe(mockUrlTree);
  });

  it('should set active uid when a valid uid is provided in query parameters', async () => {
    const validUid = '123'; // Valid UID from mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ uid: validUid }),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: validUid,
    };
    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    // Mock userUidsLoaded signal return value
    jest.spyOn(agridataStateService, 'userUidsLoaded').mockReturnValue(true);
    // Mock userUids to include the valid uid
    jest.spyOn(agridataStateService, 'userUids').mockReturnValue([{ uid: validUid } as UidDto]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(validUid);
    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      validUid,
      testConsentRequestId,
    ]);
    expect(result).toBe(mockUrlTree);
  });

  it('should load authorized uids when userUids are not loaded and uid is provided', async () => {
    const validUid = '123'; // Valid UID from mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ uid: validUid }),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: validUid,
    };
    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    // Mock userUidsLoaded signal to return false to test the getAuthorizedUids path
    jest.spyOn(agridataStateService, 'userUidsLoaded').mockReturnValue(false);
    // Make sure mockUserService.getAuthorizedUids returns the correct data
    (mockUserService.getAuthorizedUids as jest.Mock).mockReturnValue(
      Promise.resolve([{ uid: validUid } as UidDto]),
    );

    const result = await createConsentRequestGuard.canActivate(route);

    expect(mockUserService.getAuthorizedUids).toHaveBeenCalled();
    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(validUid);
    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      validUid,
      testConsentRequestId,
    ]);
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to error page when an invalid uid is provided', async () => {
    const invalidUid = 'invalid-uid'; // This uid does not exist in mockUserService
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({ uid: invalidUid }),
    } as ActivatedRouteSnapshot;
    // Mock userUidsLoaded signal to return true
    jest.spyOn(agridataStateService, 'userUidsLoaded').mockReturnValue(true);
    // Mock userUids to return UIDs that don't contain the invalid UID
    jest
      .spyOn(agridataStateService, 'userUids')
      .mockReturnValue([
        { uid: '1' } as UidDto,
        { uid: '2' } as UidDto,
        { uid: testUid } as UidDto,
      ]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(agridataStateService.userUidsLoaded).toHaveBeenCalled();
    expect(agridataStateService.userUids).toHaveBeenCalled();
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
    // Verify that setActiveUid was not called with the invalid uid
    expect(agridataStateService.setActiveUid).not.toHaveBeenCalledWith(invalidUid);
  });

  it('should redirect to error page when createConsentRequests throws an error', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const testError = new Error('Test error');
    consentRequestService.createConsentRequests.mockRejectedValue(testError);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should handle non-Error exceptions and wrap them in Error', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const nonErrorException = 'string error';
    consentRequestService.createConsentRequests.mockRejectedValue(nonErrorException);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should redirect to consent requests overview when no activeUid is set', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    consentRequestService.createConsentRequests.mockResolvedValue([mockConsentRequest]);
    const expectedCreateDto: CreateConsentRequestDto[] = [
      { uid: testUid, dataRequestId: testDataRequestUid },
    ];
    agridataStateService.activeUid.set(undefined);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(expectedCreateDto);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
    ]);
    expect(result).toBe(mockUrlTree);
  });
});
