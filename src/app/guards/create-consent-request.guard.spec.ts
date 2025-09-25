import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, convertToParamMap } from '@angular/router';

import { CreateConsentRequestGuard } from '@/app/guards/create-consent-request.guard';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { ConsentRequestCreatedDto } from '@/entities/openapi/model/consentRequestCreatedDto';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { mockParticipantService } from '@/shared/testing/mocks';
import { mockAgridataStateService } from '@/shared/testing/mocks/mock-agridata-state.service';

import { ProducerUidGuard } from './producer-uid.guard';

describe('createConsentRequestGuard', () => {
  let createConsentRequestGuard: CreateConsentRequestGuard;
  let consentRequestService: ConsentRequestService;

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

  let mockAgridataStateServiceInstance: ReturnType<typeof mockAgridataStateService>;

  beforeEach(() => {
    mockRouter = {
      createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
      parseUrl: jest.fn().mockReturnValue(mockErrorUrlTree),
      navigate: jest.fn(),
    };

    mockProducerUidGuard = {
      canActivate: jest.fn().mockResolvedValue(true),
    };

    const consentServiceMock = {
      createConsentRequests: jest.fn(),
      fetchConsentRequests: {
        reload: jest.fn(),
      },
    };

    mockAgridataStateServiceInstance = mockAgridataStateService(testUid);

    TestBed.configureTestingModule({
      providers: [
        CreateConsentRequestGuard,
        { provide: ConsentRequestService, useValue: consentServiceMock },
        { provide: UserService, useValue: mockParticipantService },
        { provide: AgridataStateService, useValue: mockAgridataStateServiceInstance },
        { provide: ProducerUidGuard, useValue: mockProducerUidGuard },
        { provide: Router, useValue: mockRouter },
      ],
    });

    createConsentRequestGuard = TestBed.inject(CreateConsentRequestGuard);
    consentRequestService = TestBed.inject(ConsentRequestService);
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
    (consentRequestService.createConsentRequests as jest.Mock).mockResolvedValue([]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(testDataRequestUid);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });

  it('should redirect to specific consent request page when a matching consent request is found', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const mockConsentRequest: ConsentRequestCreatedDto = {
      id: testConsentRequestId,
      dataProducerUid: testUid,
    };
    (consentRequestService.createConsentRequests as jest.Mock).mockResolvedValue([
      mockConsentRequest,
    ]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(testDataRequestUid);
    expect(consentRequestService.fetchConsentRequests.reload).toHaveBeenCalled();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      testUid,
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
    (consentRequestService.createConsentRequests as jest.Mock).mockResolvedValue([
      mockConsentRequest,
    ]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(testDataRequestUid);
    expect(consentRequestService.fetchConsentRequests.reload).toHaveBeenCalled();
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
    (consentRequestService.createConsentRequests as jest.Mock).mockResolvedValue([
      mockConsentRequest,
    ]);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(testDataRequestUid);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
    ]);
    expect(result).toBe(mockUrlTree);
  });

  it('should redirect to error page when createConsentRequests throws an error', async () => {
    const route = {
      paramMap: convertToParamMap({ dataRequestUid: testDataRequestUid }),
      queryParamMap: convertToParamMap({}),
    } as ActivatedRouteSnapshot;
    const testError = new Error('Test error');
    (consentRequestService.createConsentRequests as jest.Mock).mockRejectedValue(testError);

    const result = await createConsentRequestGuard.canActivate(route);

    expect(consentRequestService.createConsentRequests).toHaveBeenCalledWith(testDataRequestUid);
    expect(mockRouter.parseUrl).toHaveBeenCalledWith(ROUTE_PATHS.ERROR);
    expect(result).toBe(mockErrorUrlTree);
  });
});
