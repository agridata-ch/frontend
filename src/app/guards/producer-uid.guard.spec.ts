import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Params,
  provideRouter,
  UrlSegment,
  UrlTree,
} from '@angular/router';

import { ProducerUidGuard } from '@/app/guards/producer-uid.guard';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { UidDto } from '@/entities/openapi';
import {
  KTIDP_IMPERSONATION_QUERY_PARAM,
  ROUTE_PATHS,
  USER_ROLES,
} from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';

describe('producerUidGuard', () => {
  let producerUidGuard: ProducerUidGuard;
  let uid: string;
  let participantService: Partial<UserService>;
  let agridataStateService: MockAgridataStateService;
  let authService: MockAuthService;
  const activatedRouteSnapshot = (
    parentUrl: string,
    url: string,
    params: Params,
  ): ActivatedRouteSnapshot => {
    return {
      parent: { url: [{ path: parentUrl }] as UrlSegment[] } as ActivatedRouteSnapshot,
      url: [{ path: url }] as UrlSegment[],
      paramMap: convertToParamMap(params),
    } as ActivatedRouteSnapshot;
  };

  beforeEach(() => {
    uid = '123';
    agridataStateService = createMockAgridataStateService();

    participantService = {
      getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: uid } as UidDto])),
    };

    authService = createMockAuthService();
    TestBed.configureTestingModule({
      providers: [
        ProducerUidGuard,
        { provide: UserService, useValue: participantService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: AuthService, useValue: authService },
        provideRouter([]),
      ],
    });
    producerUidGuard = TestBed.inject(ProducerUidGuard);
  });

  it('should be created', () => {
    expect(producerUidGuard).toBeTruthy();
  });

  it('should return true if uri contains authorized uid', async () => {
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: uid }),
    );
    expect(guardResult).toEqual(true);
  });

  it('should change active uid if different uid is provided', async () => {
    const newUid = '444';
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);
    (participantService.getAuthorizedUids as jest.MockedFn<any>).mockResolvedValueOnce(
      Promise.resolve([{ uid: uid } as UidDto, { uid: newUid } as UidDto]),
    );
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: newUid }),
    );
    expect(guardResult).toEqual(true);
    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(newUid);
  });

  it('should rewrite route to consentrequest/uid using set uid', async () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);
    authService.__testSignals.isProducer.set(true);

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(
        `/${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${uid}`,
      );
    }
  });

  it('should rewrite route to consentrequest/uid using set uid when impersonation is active', async () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_SUPPORTER]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);

    sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, 'fakeKtIdp');
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(
        `/${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${uid}`,
      );
    }
    sessionStorage.clear();
  });

  it('should not rewrite route if not on consent request route', async () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    const guardResult = await producerUidGuard.canActivate(activatedRouteSnapshot('', '', {}));
    expect(guardResult).toEqual(true);
  });

  it('should redirect to error if user doesnt own uid', async () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: '999' }),
    );
    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
    }
  });

  it('should accept request if the user is not a producer', async () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    expect(guardResult).toEqual(true);
  });

  it('should accept request if the user is supporter and impersonation is not active', async () => {
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_SUPPORTER]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    expect(guardResult).toEqual(true);
  });

  it('should return error page if api call failed', async () => {
    (participantService.getAuthorizedUids as jest.MockedFn<any>).mockRejectedValueOnce(
      new Error('API error'),
    );
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
    }
  });

  it('should handle non-Error exceptions and wrap them in Error', async () => {
    const nonErrorException = 'string error';
    authService.isAuthenticated.set(true);
    authService.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);

    (participantService.getAuthorizedUids as jest.MockedFn<any>).mockRejectedValueOnce(
      nonErrorException,
    );
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
    }
  });
});
