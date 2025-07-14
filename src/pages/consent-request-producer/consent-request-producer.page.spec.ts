import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ConsentRequestService } from '@/entities/api';
import {
  ConsentRequestDto,
  ConsentRequestDtoDataRequestStateCode,
  ConsentRequestStateEnum,
} from '@/entities/openapi';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';

describe('ConsentRequestProducerPage - component behavior', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let componentRef: ComponentRef<ConsentRequestProducerPage>;
  let mockConsentService: {
    fetchConsentRequests: jest.Mock<Promise<ConsentRequestDto[]>, []>;
    updateConsentRequestStatus: jest.Mock<Promise<void>, [string, string]>;
  };
  let mockRouter: { navigate: jest.Mock<void, [string[], { replaceUrl: boolean }]> };
  let mockI18n: {
    currentLanguage: jest.Mock<string, []>;
    useObjectTranslation: jest.Mock<void, [string]>;
    translate: jest.Mock<string, [string]>;
    lang: jest.Mock<string, []>;
  };

  const sampleRequests: ConsentRequestDto[] = [
    {
      id: '1',
      stateCode: ConsentRequestStateEnum.Opened,
      requestDate: '2025-05-01',
      dataRequest: {
        dataConsumer: { name: 'Alice' },
        title: { de: 'Antrag A' },
        stateCode: ConsentRequestDtoDataRequestStateCode.Draft,
      },
    } as ConsentRequestDto,
    {
      id: '2',
      stateCode: ConsentRequestStateEnum.Granted,
      requestDate: '2025-05-02',
      dataRequest: {
        dataConsumer: { name: 'Bob' },
        title: { de: 'Antrag B' },
        stateCode: ConsentRequestDtoDataRequestStateCode.Draft,
      },
    } as ConsentRequestDto,
    {
      id: '3',
      stateCode: ConsentRequestStateEnum.Declined,
      requestDate: '2025-05-03',
      dataRequest: {
        dataConsumer: { name: 'Charlie' },
        title: { de: 'Antrag C' },
        stateCode: ConsentRequestDtoDataRequestStateCode.Draft,
      },
    } as ConsentRequestDto,
  ];

  beforeEach(async () => {
    mockConsentService = {
      fetchConsentRequests: jest.fn().mockResolvedValue(sampleRequests),
      updateConsentRequestStatus: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockI18n = {
      currentLanguage: jest.fn().mockReturnValue('de'),
      useObjectTranslation: jest.fn().mockImplementation((key) => key),
      translate: jest.fn().mockImplementation((key) => key),
      lang: jest.fn().mockReturnValue('de'),
    };

    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: mockConsentService },
        { provide: Router, useValue: mockRouter },
        { provide: I18nService, useValue: mockI18n },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('showConsentRequestDetails sets selectedRequest and calls router.navigate', () => {
    const req = sampleRequests[0];
    expect(component.selectedRequest()).toBeNull();

    component.showConsentRequestDetails(req);
    expect(component.selectedRequest()).toBe(req);
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH,
      req.id,
    ]);
  });

  it('showConsentRequestDetails sets selectedRequest to null if called with undefined', () => {
    component.selectedRequest.set(sampleRequests[0]);
    component.showConsentRequestDetails();
    expect(component.selectedRequest()).toBeNull();
  });

  it('reloadConsentRequests calls consentRequestResult.reload', () => {
    const reloadSpy = jest.spyOn(component.consentRequestResult, 'reload');
    component.reloadConsentRequests();
    expect(reloadSpy).toHaveBeenCalled();
  });

  describe('effect for consentRequestId', () => {
    it('does not call showConsentRequestDetails if consentRequestResult is loading', () => {
      jest.spyOn(component.consentRequestResult, 'isLoading').mockReturnValue(true);
      const showSpy = jest.spyOn(component, 'showConsentRequestDetails');
      // Set input using componentRef
      componentRef.setInput('consentRequestId', '1');
      fixture.detectChanges();
      expect(showSpy).not.toHaveBeenCalled();
    });

    it('calls showConsentRequestDetails with correct request if consentRequestId is set and not loading', () => {
      jest.spyOn(component.consentRequestResult, 'isLoading').mockReturnValue(false);
      jest.spyOn(component.consentRequestResult, 'value').mockReturnValue(sampleRequests);
      const showSpy = jest.spyOn(component, 'showConsentRequestDetails');
      componentRef.setInput('consentRequestId', '2');
      fixture.detectChanges();
      expect(showSpy).toHaveBeenCalledWith(sampleRequests[1]);
    });

    it('does not call showConsentRequestDetails if consentRequestId is not set', () => {
      jest.spyOn(component.consentRequestResult, 'isLoading').mockReturnValue(false);
      jest.spyOn(component.consentRequestResult, 'value').mockReturnValue(sampleRequests);
      const showSpy = jest.spyOn(component, 'showConsentRequestDetails');
      componentRef.setInput('consentRequestId', '');
      fixture.detectChanges();
      expect(showSpy).not.toHaveBeenCalled();
    });
  });
});
