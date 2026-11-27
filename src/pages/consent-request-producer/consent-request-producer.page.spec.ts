import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import type { Mocked } from 'vitest';

import { ConsentRequestService, DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import { AnalyticsService } from '@/shared/lib/analytics.service';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockActivatedRoute,
  createMockAuthService,
  createMockDataRequestService,
  createMockI18nService,
  MockActivatedRoute,
  MockAuthService,
  mockConsentRequestAggregations,
  MockDataRequestService,
  MockI18nService,
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockAnalyticsService,
  createMockConsentRequestService,
  MockConsentRequestService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks';

describe('ConsentRequestProducerPage - component behavior', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let mockRouter: Mocked<Router>;
  let metadataService: MockMasterDataService;
  let agridataStateService: MockAgridataStateService;
  let i18nService: MockI18nService;
  let consentRequestService: MockConsentRequestService;
  let errorService: MockErrorHandlerService;
  let dataRequestService: MockDataRequestService;
  let activeRoute: MockActivatedRoute;
  let authService: MockAuthService;
  const activeUid = '123';

  beforeEach(async () => {
    const routerEvents$ = new Subject<NavigationEnd>();
    mockRouter = {
      navigate: vi.fn().mockResolvedValue(true),
      currentNavigation: vi.fn().mockReturnValue(null),
      url: '/consent-request-producer',
      events: routerEvents$.asObservable(),
    } as unknown as Mocked<Router>;

    consentRequestService = createMockConsentRequestService();
    dataRequestService = createMockDataRequestService();
    metadataService = createMockMasterDataService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();
    authService = createMockAuthService();
    activeRoute = createMockActivatedRoute();
    agridataStateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: Router, useValue: mockRouter },
        { provide: I18nService, useValue: i18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: MasterDataService, useValue: metadataService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AnalyticsService, useValue: createMockAnalyticsService() },
        { provide: ActivatedRoute, useValue: activeRoute },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('routes to the aggregation on selecting a request', () => {
    const navSpy = vi.spyOn(mockRouter, 'navigate');
    const req = mockConsentRequestAggregations[0];

    component['navigateToRequest'](req);

    expect(navSpy).toHaveBeenCalledWith([req.id], {
      relativeTo: activeRoute,
    });
  });

  it('does not route when the aggregation has no id', () => {
    const navSpy = vi.spyOn(mockRouter, 'navigate');

    component['navigateToRequest'](null);

    expect(navSpy).not.toHaveBeenCalled();
  });

  it('should handle errors from consentRequestResource and send them to errorService', async () => {
    const testError = new Error('Test error from fetchConsentRequests');
    consentRequestService.fetchConsentRequests.mockRejectedValueOnce(testError);

    agridataStateService.__testSignals.activeUid.set(activeUid);
    const errorFixture = TestBed.createComponent(ConsentRequestProducerPage);

    // Create a new fixture with the mocked error
    errorFixture.detectChanges();
    // whenStable may reject because the resource enters an error state; swallow that to allow assertions
    try {
      await errorFixture.whenStable();
    } catch {
      // ignore the thrown resource error — component should forward it to the error handler
    }

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });
});
