import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Params,
  UrlSegment,
  UrlTree,
  convertToParamMap,
  provideRouter,
} from '@angular/router';

import { ProducerUidGuard } from '@/app/guards/producer-uid.guard';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UserService } from '@/entities/api/user.service';
import { UidDto } from '@/entities/openapi';
import { KTIDP_IMPERSONATION_QUERY_PARAM, ROUTE_PATHS } from '@/shared/constants/constants';
import { AuthService } from '@/shared/lib/auth';
import { MockAuthService } from '@/shared/testing/mocks';
import { mockAgridataStateService } from '@/shared/testing/mocks/mock-agridata-state.service';

describe('producerUidGuard', () => {
  let producerUidGuard: ProducerUidGuard;
  let uid: string;
  let participantService: Partial<UserService>;
  let agridataStateService: Partial<AgridataStateService>;
  let authService: Partial<AuthService>;
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
    agridataStateService = mockAgridataStateService(uid);

    participantService = {
      getAuthorizedUids: jest.fn().mockReturnValue(Promise.resolve([{ uid: uid } as UidDto])),
    };

    TestBed.configureTestingModule({
      providers: [
        ProducerUidGuard,
        { provide: UserService, useValue: participantService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: AuthService, useClass: MockAuthService },
        provideRouter([]),
      ],
    });
    producerUidGuard = TestBed.inject(ProducerUidGuard);
    authService = TestBed.inject(AuthService);
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
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(true);
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
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(true);
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
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isSupporter').mockReturnValue(true);
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
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(true);
    const guardResult = await producerUidGuard.canActivate(activatedRouteSnapshot('', '', {}));
    expect(guardResult).toEqual(true);
  });

  it('should redirect to error if user doesnt own uid', async () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(true);
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: '999' }),
    );
    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
    }
  });

  it('should accept request if the user is not a producer', async () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isProducer').mockReturnValue(false);
    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );
    expect(guardResult).toEqual(true);
  });

  it('should accept request if the user is supporter and impersonation is not active', async () => {
    jest.spyOn(authService, 'isAuthenticated').mockReturnValue(true);
    jest.spyOn(authService, 'isSupporter').mockReturnValue(true);
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
});
