import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Params,
  provideRouter,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { of, throwError } from 'rxjs';

import { ProducerUidGuard } from '@/app/guards/producer-uid.guard';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
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
import {
  createMockAuthService,
  MockAuthService,
  mockUserInfo,
} from '@/shared/testing/mocks/mock-auth-service';

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
    authService.initializeUserInfo.mockReturnValue(of(mockUserInfo));
    authService.initializeAuthorizedUids.mockReturnValue(of([{ uid: uid } as UidDto]));
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

  it('should return true if uri contains authorized uid', (done) => {
    producerUidGuard
      .canActivate(
        activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: uid }),
      )
      .subscribe((guardResult) => {
        expect(guardResult).toEqual(true);
        done();
      });
  });

  it('should change active uid if different uid is provided', (done) => {
    const newUid = '444';
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);
    authService.initializeAuthorizedUids.mockReturnValue(of([{ uid: newUid } as UidDto]));

    producerUidGuard
      .canActivate(
        activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: newUid }),
      )
      .subscribe((guardResult) => {
        expect(guardResult).toEqual(true);
        expect(agridataStateService.setActiveUid).toHaveBeenCalledWith(newUid);
        done();
      });
  });

  it('should rewrite route to consentrequest/uid using set uid', (done) => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);
    authService.__testSignals.isProducer.set(true);

    producerUidGuard
      .canActivate(activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}))
      .subscribe((guardResult) => {
        expect(guardResult).toBeInstanceOf(UrlTree);
        if (guardResult instanceof UrlTree) {
          expect(guardResult.toString()).toEqual(
            `/${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${uid}`,
          );
        }
        done();
      });
  });

  it('should rewrite route to consentrequest/uid using set uid when impersonation is active', (done) => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_SUPPORTER]);
    agridataStateService.getDefaultUid.mockReturnValue(uid);

    sessionStorage.setItem(KTIDP_IMPERSONATION_QUERY_PARAM, 'fakeKtIdp');
    producerUidGuard
      .canActivate(activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}))
      .subscribe((guardResult) => {
        expect(guardResult).toBeInstanceOf(UrlTree);
        if (guardResult instanceof UrlTree) {
          expect(guardResult.toString()).toEqual(
            `/${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${uid}`,
          );
        }
        sessionStorage.clear();
        done();
      });
  });

  it('should not rewrite route if not on consent request route', (done) => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    producerUidGuard.canActivate(activatedRouteSnapshot('', '', {})).subscribe((guardResult) => {
      expect(guardResult).toEqual(true);
      done();
    });
  });

  it('should redirect to error if user doesnt own uid', (done) => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.userRoles.set([USER_ROLES.AGRIDATA_CONSENT_REQUESTS_PRODUCER]);
    authService.__testSignals.isProducer.set(true);

    producerUidGuard
      .canActivate(
        activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', { uid: '999' }),
      )
      .subscribe((guardResult) => {
        expect(guardResult).toBeInstanceOf(UrlTree);
        if (guardResult instanceof UrlTree) {
          expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
        }
        done();
      });
  });

  it('should return error page if api call failed', (done) => {
    authService.__testSignals.isAuthenticated.set(true);
    authService.__testSignals.isProducer.set(true);
    authService.initializeAuthorizedUids.mockReturnValue(throwError(() => new Error('api error')));

    producerUidGuard
      .canActivate(activatedRouteSnapshot(ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, '', {}))
      .subscribe((guardResult) => {
        expect(guardResult).toBeInstanceOf(UrlTree);
        if (guardResult instanceof UrlTree) {
          expect(guardResult.toString()).toEqual(`/${ROUTE_PATHS.ERROR}`);
        }
        done();
      });
  });
});
