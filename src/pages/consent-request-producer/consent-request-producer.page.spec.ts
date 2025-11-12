import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService, DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MetaDataService } from '@/entities/api/meta-data-service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';
import { I18nService } from '@/shared/i18n';
import {
  createMockDataRequestService,
  createMockI18nService,
  mockConsentRequests,
  MockDataRequestService,
  MockI18nService,
} from '@/shared/testing/mocks';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAnalyticsService } from '@/shared/testing/mocks/mock-analytics-service';
import {
  createMockConsentRequestService,
  MockConsentRequestService,
} from '@/shared/testing/mocks/mock-consent-request-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import {
  createMockMetadataService,
  MockMetaDataService,
} from '@/shared/testing/mocks/mock-meta-data-service';

describe('ConsentRequestProducerPage - component behavior', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let mockRouter: jest.Mocked<Router>;
  let metadataService: MockMetaDataService;
  let agridataStateService: MockAgridataStateService;
  let i18nService: MockI18nService;
  let consentRequestService: MockConsentRequestService;
  let errorService: MockErrorHandlerService;
  let dataRequestService: MockDataRequestService;
  let activeRoute: Partial<ActivatedRoute>;
  const activeUid = '123';

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
      currentNavigation: jest.fn().mockReturnValue(null),
    } as unknown as jest.Mocked<Router>;

    consentRequestService = createMockConsentRequestService();
    dataRequestService = createMockDataRequestService();
    metadataService = createMockMetadataService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();
    activeRoute = {};
    agridataStateService = createMockAgridataStateService();
    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: Router, useValue: mockRouter },
        { provide: I18nService, useValue: i18nService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: MetaDataService, useValue: metadataService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: AnalyticsService, useValue: createMockAnalyticsService() },
        { provide: ActivatedRoute, useValue: activeRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('route to consent request details on selecting request', () => {
    const navSpy = jest.spyOn(mockRouter, 'navigate');
    const req = mockConsentRequests[0];

    component['navigateToRequest'](req);

    expect(navSpy).toHaveBeenCalledWith([req.id], { relativeTo: activeRoute });
  });

  it('reloadConsentRequests calls consentRequests.reload', () => {
    const reloadSpy = jest.spyOn(component.consentRequestResource, 'reload');
    component.reloadConsentRequests();
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should handle errors from consentRequestResource and send them to errorService', async () => {
    const testError = new Error('Test error from fetchConsentRequests');
    (consentRequestService.fetchConsentRequests as jest.Mock).mockRejectedValueOnce(testError);
    agridataStateService.activeUid.set(activeUid);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(ConsentRequestProducerPage);
    errorFixture.detectChanges();
    // whenStable may reject because the resource enters an error state; swallow that to allow assertions
    try {
      await errorFixture.whenStable();
    } catch {
      // ignore the thrown resource error — component should forward it to the error handler
    }

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  describe('migration info handling', () => {
    it('should show migration alerts for migrated requests', () => {
      jest.spyOn(component.consentRequestResource, 'isLoading').mockReturnValue(false);
      jest.spyOn(component.consentRequestResource, 'value').mockReturnValue(mockConsentRequests);

      fixture.detectChanges();

      expect(component.visibleMigratedRequests()).toHaveLength(2);
      expect(component.visibleMigratedRequests()[0]).toBe(mockConsentRequests[0]);
      expect(component.visibleMigratedRequests()[1]).toBe(mockConsentRequests[2]);
    });

    it('should remove request from visibleMigratedRequests when closeMigrationInfo is called', () => {
      jest.spyOn(component.consentRequestResource, 'isLoading').mockReturnValue(false);
      jest.spyOn(component.consentRequestResource, 'value').mockReturnValue(mockConsentRequests);

      fixture.detectChanges();

      expect(component.visibleMigratedRequests()).toHaveLength(2);

      component.closeMigrationInfo('1');
      fixture.detectChanges();

      expect(component.visibleMigratedRequests()).toHaveLength(1);
      expect(component.visibleMigratedRequests()[0].id).toBe('3');
    });

    it('should return empty array when no migrated requests exist', () => {
      const nonMigratedRequests = mockConsentRequests.filter((req) => !req.showStateAsMigrated);
      jest.spyOn(component.consentRequestResource, 'value').mockReturnValue(nonMigratedRequests);
      fixture.detectChanges();

      expect(component.visibleMigratedRequests()).toHaveLength(0);
    });

    it('should return migrated request title with data request name if available', () => {
      const migratedRequest = {
        ...mockConsentRequests[0],
        dataRequest: {
          ...mockConsentRequests[0].dataRequest,
        },
      } as ConsentRequestProducerViewDto;

      const title = component.getMigratedRequestTitle(migratedRequest);

      expect(title).toBe(mockConsentRequests[0].dataRequest?.title?.de);
    });
  });
});
