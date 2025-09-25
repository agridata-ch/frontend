import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef, ResourceRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService } from '@/entities/api/consent-request.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { MockResources } from '@/shared/testing/mocks/mock-resources';
import { ToastService } from '@/shared/toast';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';

describe('ConsentRequestDetailsComponent', () => {
  let fixture: ComponentFixture<ConsentRequestDetailsComponent>;
  let component: ConsentRequestDetailsComponent;
  let componentRef: ComponentRef<ConsentRequestDetailsComponent>;
  let toastService: { show: jest.Mock };
  let consentRequestService: {
    updateConsentRequestStatus: jest.Mock;
    fetchConsentRequests: ResourceRef<ConsentRequestProducerViewDto[]>;
  };

  beforeEach(async () => {
    toastService = { show: jest.fn() };
    consentRequestService = {
      updateConsentRequestStatus: jest.fn().mockResolvedValue({}),
      fetchConsentRequests: MockResources.createMockResourceRef([]),
    };

    await TestBed.configureTestingModule({
      imports: [ConsentRequestDetailsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastService },
        { provide: ConsentRequestService, useValue: consentRequestService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestDetailsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show details before a request is set', () => {
    expect(component.showDetails()).toBe(false);
  });

  it('setting request should open details', () => {
    const req = {
      dataRequest: { dataConsumer: { name: 'TestConsumer' } },
    } as unknown as ConsentRequestProducerViewDto;

    componentRef.setInput('request', req);
    fixture.detectChanges(); // run the effect

    expect(component.showDetails()).toBe(true);
  });

  it('handleCloseDetails hides the details and emits closeDetail', () => {
    const req = {
      requestDate: new Date(),
      dataRequest: { dataConsumer: { name: 'John' } },
    } as unknown as ConsentRequestProducerViewDto;

    componentRef.setInput('request', req);
    fixture.detectChanges();
    expect(component.showDetails()).toBe(true);

    let emitted = false;
    component.closeDetail.subscribe(() => (emitted = true));

    component.handleCloseDetails();
    fixture.detectChanges();

    expect(component.showDetails()).toBe(false);
    expect(emitted).toBe(true);
  });

  it('should close details when Escape key is pressed', async () => {
    component.showDetails.set(true);
    fixture.detectChanges();

    const closeSpy = jest.spyOn(component, 'handleCloseDetails');

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);

    await Promise.resolve();

    expect(closeSpy).toHaveBeenCalled();
    expect(component.showDetails()).toBe(false);
  });

  it('should should show toast after acceptRequest', async () => {
    const req = {
      id: '123',
      dataRequest: { dataConsumer: { name: 'TestConsumer' } },
    } as unknown as ConsentRequestProducerViewDto;
    componentRef.setInput('request', req);
    fixture.detectChanges();

    consentRequestService.updateConsentRequestStatus.mockResolvedValue({});

    const closeSpy = jest.spyOn(component, 'handleCloseDetails');
    await component.acceptRequest();

    await Promise.resolve();

    expect(toastService.show).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith('123', 'GRANTED');
    expect(consentRequestService.fetchConsentRequests.reload).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should should show toast after rejectRequest', async () => {
    const req = {
      id: '456',
      dataRequest: { dataConsumer: { name: 'TestConsumer' } },
    } as unknown as ConsentRequestProducerViewDto;
    componentRef.setInput('request', req);
    fixture.detectChanges();

    consentRequestService.updateConsentRequestStatus.mockResolvedValue({});

    const closeSpy = jest.spyOn(component, 'handleCloseDetails');
    await component.rejectRequest();

    await Promise.resolve();

    expect(toastService.show).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith(
      '456',
      'DECLINED',
    );
    expect(consentRequestService.fetchConsentRequests.reload).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });
});
