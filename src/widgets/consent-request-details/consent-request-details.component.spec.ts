import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestService } from '@/entities/api/consent-request.service';
import { ConsentRequestDto } from '@/entities/openapi';
import { ToastService } from '@/shared/toast';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';

describe('ConsentRequestDetailsComponent', () => {
  let component: ConsentRequestDetailsComponent;
  let fixture: ComponentFixture<ConsentRequestDetailsComponent>;
  let toastService: { show: jest.Mock };
  let consentRequestService: {
    updateConsentRequestStatus: jest.Mock;
    fetchConsentRequests: jest.Mock;
  };

  beforeEach(async () => {
    toastService = { show: jest.fn() };
    consentRequestService = {
      updateConsentRequestStatus: jest.fn().mockResolvedValue({}),
      fetchConsentRequests: jest.fn(),
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
    } as unknown as ConsentRequestDto;

    component.request = req;
    fixture.detectChanges(); // run the effect

    expect(component.showDetails()).toBe(true);
  });

  it('handleCloseDetails hides the details and emits onCloseDetail', () => {
    const req = {
      requestDate: new Date(),
      dataRequest: { dataConsumer: { name: 'John' } },
    } as unknown as ConsentRequestDto;

    component.request = req;
    fixture.detectChanges();
    expect(component.showDetails()).toBe(true);

    let emitted = false;
    component.onCloseDetail.subscribe(() => (emitted = true));

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
    } as unknown as ConsentRequestDto;
    component.request = req;
    fixture.detectChanges();

    const closeSpy = jest.spyOn(component, 'handleCloseDetails');
    await component.acceptRequest();

    expect(toastService.show).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith('123', 'GRANTED');
    expect(consentRequestService.fetchConsentRequests).toHaveBeenCalled();
  });

  it('should should show toast after rejectRequest', async () => {
    const req = {
      id: '456',
      dataRequest: { dataConsumer: { name: 'TestConsumer' } },
    } as unknown as ConsentRequestDto;
    component.request = req;
    fixture.detectChanges();

    const closeSpy = jest.spyOn(component, 'handleCloseDetails');
    await component.rejectRequest();

    expect(toastService.show).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith(
      '456',
      'DECLINED',
    );
    expect(consentRequestService.fetchConsentRequests).toHaveBeenCalled();
  });
});
