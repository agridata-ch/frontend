import { Location } from '@angular/common';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService, DataRequestService } from '@/entities/api';
import {
  ConsentRequestDetailViewDto,
  ConsentRequestDetailViewDtoDataRequestStateCode,
  ConsentRequestStateEnum,
} from '@/entities/openapi';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { MockDataRequestService, MockI18nService } from '@/shared/testing/mocks';

describe('ConsentRequestProducerPage - component behavior', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let componentRef: ComponentRef<ConsentRequestProducerPage>;
  let mockConsentService: jest.Mocked<ConsentRequestService>;
  let mockLocation: jest.Mocked<Location>;

  const sampleRequests: ConsentRequestDetailViewDto[] = [
    {
      id: '1',
      stateCode: ConsentRequestStateEnum.Opened,
      requestDate: '2025-05-01',
      dataRequest: {
        dataConsumer: { name: 'Alice' },
        title: { de: 'Antrag A' },
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      },
    } as ConsentRequestDetailViewDto,
    {
      id: '2',
      stateCode: ConsentRequestStateEnum.Granted,
      requestDate: '2025-05-02',
      dataRequest: {
        dataConsumer: { name: 'Bob' },
        title: { de: 'Antrag B' },
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      },
    } as ConsentRequestDetailViewDto,
    {
      id: '3',
      stateCode: ConsentRequestStateEnum.Declined,
      requestDate: '2025-05-03',
      dataRequest: {
        dataConsumer: { name: 'Charlie' },
        title: { de: 'Antrag C' },
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      },
    } as ConsentRequestDetailViewDto,
  ];

  beforeEach(async () => {
    mockConsentService = {
      fetchConsentRequests: {
        value: jest.fn().mockReturnValue(sampleRequests),
        isLoading: jest.fn(),
        reload: jest.fn(),
      },
    } as unknown as jest.Mocked<ConsentRequestService>;
    mockLocation = {
      go: jest.fn(),
    } as unknown as jest.Mocked<Location>;

    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: mockConsentService },
        { provide: Location, useValue: mockLocation },
        { provide: I18nService, useClass: MockI18nService },
        { provide: DataRequestService, useValue: MockDataRequestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('setSelectedRequest sets selectedRequest and calls router.navigate', () => {
    const req = sampleRequests[0];
    expect(component.selectedRequest()).toBeNull();

    component.setSelectedRequest(req);
    expect(component.selectedRequest()).toBe(req);
    expect(mockLocation.go).toHaveBeenCalledWith(
      `${ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH}/${req.id}`,
    );
  });

  it('setSelectedRequest sets selectedRequest to null if called with undefined', () => {
    component.selectedRequest.set(sampleRequests[0]);
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
      jest.spyOn(mockConsentService.fetchConsentRequests, 'isLoading').mockReturnValue(false);
      jest.spyOn(mockConsentService.fetchConsentRequests, 'value').mockReturnValue(sampleRequests);

      componentRef.setInput('consentRequestId', '2');
      fixture.detectChanges();
      expect(component.selectedRequest()).toEqual(sampleRequests[1]);
    });

    it('does not call setSelectedRequest if consentRequestId is not set', () => {
      jest.spyOn(component.consentRequests, 'isLoading').mockReturnValue(false);
      jest.spyOn(component.consentRequests, 'value').mockReturnValue(sampleRequests);
      const showSpy = jest.spyOn(component, 'setSelectedRequest');
      componentRef.setInput('consentRequestId', '');
      fixture.detectChanges();
      expect(showSpy).not.toHaveBeenCalled();
    });
  });
});
