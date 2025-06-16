import { Location } from '@angular/common';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestProducerPage } from '@/pages/consent-request-producer';

describe('ConsentRequestProducerPage - component behavior', () => {
  let fixture: ComponentFixture<ConsentRequestProducerPage>;
  let component: ConsentRequestProducerPage;
  let componentRef: ComponentRef<ConsentRequestProducerPage>;
  let mockConsentService: {
    fetchConsentRequests: jest.Mock<Promise<ConsentRequestDto[]>, []>;
    updateConsentRequestStatus: jest.Mock<Promise<void>, [string, string]>;
  };
  let mockLocation: { go: jest.Mock<void, [string]> };

  const sampleRequests: ConsentRequestDto[] = [
    {
      id: '1',
      stateCode: ConsentRequestStateEnum.Opened,
      requestDate: '2025-05-01',
      dataRequest: { dataConsumer: { name: 'Alice' }, title: { de: 'Antrag A' } },
    } as ConsentRequestDto,
    {
      id: '2',
      stateCode: ConsentRequestStateEnum.Granted,
      requestDate: '2025-05-02',
      dataRequest: { dataConsumer: { name: 'Bob' }, title: { de: 'Antrag B' } },
    } as ConsentRequestDto,
    {
      id: '3',
      stateCode: ConsentRequestStateEnum.Declined,
      requestDate: '2025-05-03',
      dataRequest: { dataConsumer: { name: 'Charlie' }, title: { de: 'Antrag C' } },
    } as ConsentRequestDto,
  ];

  beforeEach(async () => {
    mockConsentService = {
      fetchConsentRequests: jest.fn().mockResolvedValue(sampleRequests),
      updateConsentRequestStatus: jest.fn(),
    };
    mockLocation = {
      go: jest.fn(),
    };

    await TestBed.configureTestingModule({
      providers: [
        ConsentRequestProducerPage,
        { provide: ConsentRequestService, useValue: mockConsentService },
        { provide: Location, useValue: mockLocation },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestProducerPage);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('showConsentRequestDetails sets selectedRequest and calls location.go when pushUrl=true', () => {
    const req = sampleRequests[0];
    expect(component.selectedRequest()).toBeNull();

    component.showConsentRequestDetails(req, true);
    expect(component.selectedRequest()).toBe(req);
    expect(mockLocation.go).toHaveBeenCalledWith(`/consent-requests/${req.id}`);
  });

  it('showConsentRequestDetails does not call location.go when pushUrl=false', () => {
    const req = sampleRequests[1];
    component.showConsentRequestDetails(req, false);
    expect(component.selectedRequest()).toBe(req);
    expect(mockLocation.go).not.toHaveBeenCalled();
  });

  it('showConsentRequestDetails sets selectedRequest to null if called with undefined', () => {
    component.selectedRequest.set(sampleRequests[0]);
    component.showConsentRequestDetails(undefined, false);
    expect(component.selectedRequest()).toBeNull();
    expect(mockLocation.go).not.toHaveBeenCalled();
  });

  it('showConsentRequestDetails calls location.go with empty id if called with undefined and pushUrl=true', () => {
    component.showConsentRequestDetails(undefined, true);
    expect(component.selectedRequest()).toBeNull();
    expect(mockLocation.go).toHaveBeenCalledWith('/consent-requests/');
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
      expect(showSpy).toHaveBeenCalledWith(sampleRequests[1], false);
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
