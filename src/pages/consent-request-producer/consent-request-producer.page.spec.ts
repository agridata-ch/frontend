import { Location } from '@angular/common';
import { ComponentRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ConsentRequestService, DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MetaDataService } from '@/entities/api/meta-data-service';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import {
  MockConsentRequestService,
  MockDataRequestService,
  MockI18nService,
  mockConsentRequests,
} from '@/shared/testing/mocks';
import { mockMetadataService } from '@/shared/testing/mocks/mock-meta-data.service';

describe('ConsentRequestProducerPage - component behavior', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let componentRef: ComponentRef<ConsentRequestProducerPage>;
  let mockLocation: jest.Mocked<Location>;
  let mockRouter: jest.Mocked<Router>;
  let metadataService: Partial<MetaDataService>;
  let agridataStateService: Partial<AgridataStateService>;
  const activeUid = '123';

  beforeEach(async () => {
    mockLocation = {
      go: jest.fn(),
    } as unknown as jest.Mocked<Location>;
    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;
    metadataService = mockMetadataService;

    agridataStateService = {
      activeUid: signal(activeUid),
    };
    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useClass: MockConsentRequestService },
        { provide: Location, useValue: mockLocation },
        { provide: Router, useValue: mockRouter },
        { provide: I18nService, useClass: MockI18nService },
        { provide: DataRequestService, useValue: MockDataRequestService },
        { provide: MetaDataService, useValue: metadataService },
        { provide: AgridataStateService, useValue: agridataStateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('setSelectedRequest sets selectedRequest and calls router.navigate', () => {
    const req = mockConsentRequests[0];
    expect(component.selectedRequest()).toBeNull();

    component.setSelectedRequest(req);
    expect(component.selectedRequest()).toBe(req);
    expect(mockLocation.go).toHaveBeenCalledWith(
      `${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${activeUid}/${req.id}`,
    );
  });

  it('setSelectedRequest sets selectedRequest to null if called with undefined', () => {
    component.selectedRequest.set(mockConsentRequests[0]);
    component.setSelectedRequest();
    expect(component.selectedRequest()).toBeNull();
  });

  it('reloadConsentRequests calls consentRequests.reload', () => {
    const reloadSpy = jest.spyOn(component.consentRequests, 'reload');
    component.reloadConsentRequests();
    expect(reloadSpy).toHaveBeenCalled();
  });

  describe('effect for consentRequestId', () => {
    it('does not call setSelectedRequest if consentRequests is loading', () => {
      jest.spyOn(component.consentRequests, 'isLoading').mockReturnValue(true);
      const showSpy = jest.spyOn(component, 'setSelectedRequest');
      // Set input using componentRef
      componentRef.setInput('consentRequestId', '1');
      fixture.detectChanges();
      expect(showSpy).not.toHaveBeenCalled();
    });

    it('calls setSelectedRequest with correct request if consentRequestId is set and not loading', () => {
      componentRef.setInput('consentRequestId', '2');
      fixture.detectChanges();
      expect(component.selectedRequest()).toEqual(mockConsentRequests[1]);
    });

    it('does not call setSelectedRequest if consentRequestId is not set', () => {
      jest.spyOn(component.consentRequests, 'isLoading').mockReturnValue(false);
      jest.spyOn(component.consentRequests, 'value').mockReturnValue(mockConsentRequests);
      const showSpy = jest.spyOn(component, 'setSelectedRequest');
      componentRef.setInput('consentRequestId', '');
      fixture.detectChanges();
      expect(showSpy).not.toHaveBeenCalled();
    });
  });
});
