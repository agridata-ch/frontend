import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Params,
  provideRouter,
  UrlSegment,
  UrlTree,
} from '@angular/router';

import { ExternalServiceHttpError } from '@/app/error/external-service-http-error';
import { ProducerUidGuard } from '@/app/guards/producer-uid.guard';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { UidDto } from '@/entities/openapi';
import {
  AGATE_LOGIN_ID_IMPERSONATION_HEADER,
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
    authService = createMockAuthService();
    authService.initializeAuthorizedUids.mockResolvedValue([{ uid: uid } as UidDto]);
    TestBed.configureTestingModule({
      providers: [
        ProducerUidGuard,
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
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);
    authService.initializeAuthorizedUids.mockResolvedValue([{ uid: newUid } as UidDto]);

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: newUid }),
    );

    expect(guardResult).toEqual(true);
    expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(newUid);
  });

  it('should rewrite route to consentrequest/uid using set uid', async () => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
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
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_SUPPORTER]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);

    sessionStorage.setItem(AGATE_LOGIN_ID_IMPERSONATION_HEADER, 'fakeAgateLoginId');

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
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);

    const guardResult = await producerUidGuard.canActivate(activatedRouteSnapshot('', '', {}));

    expect(guardResult).toEqual(true);
  });

  it('should redirect to error if user doesnt own uid', async () => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: '999' }),
    );

    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.FORBIDDEN}`);
    }
  });

  it('should return error page if api call failed', async () => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.isProducer.set(true);
    authService.initializeAuthorizedUids.mockRejectedValue(new Error('api error'));

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );

    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
    }
  });

  it('should redirect to external service error page when ExternalServiceHttpError is thrown', async () => {
    authService.initializeAuthorizedUids.mockRejectedValueOnce(new ExternalServiceHttpError());

    const guardResult = await producerUidGuard.canActivate(
      activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}),
    );

    expect(guardResult).toBeInstanceOf(UrlTree);
    if (guardResult instanceof UrlTree) {
      expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.EXTERNAL_SERVICE_ERROR}`);
    }
  });
});
