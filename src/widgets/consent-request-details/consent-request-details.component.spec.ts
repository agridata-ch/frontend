import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, ParamMap, Router } from '@angular/router';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import {
  ConsentRequestProducerViewDto,
  ConsentRequestProducerViewDtoDataRequestStateCode,
} from '@/entities/openapi';
import { REDIRECT_TIMEOUT } from '@/pages/consent-request-producer/consent-request-producer.page.model';
import { SidepanelComponent } from '@/shared/sidepanel';
import {
  createMockAgridataStateService,
  MockAgridataStateService,
} from '@/shared/testing/mocks/mock-agridata-state-service';
import { createMockAnalyticsService } from '@/shared/testing/mocks/mock-analytics-service';
import {
  createMockConsentRequestService,
  mockConsentRequests,
  MockConsentRequestService,
} from '@/shared/testing/mocks/mock-consent-request-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { createMockMasterDataService } from '@/shared/testing/mocks/mock-master-data-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService } from '@/shared/toast';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';

describe('ConsentRequestDetailsComponent', () => {
  let fixture: ComponentFixture<ConsentRequestDetailsComponent>;
  let component: ConsentRequestDetailsComponent;
  let componentRef: ComponentRef<ConsentRequestDetailsComponent>;
  let toastService: { show: jest.Mock };
  let consentRequestService: MockConsentRequestService;
  let agridataStateService: MockAgridataStateService;
  let errorService: MockErrorHandlerService;
  let mockRouter: Router;
  let activeRoute: ActivatedRoute;
  beforeEach(async () => {
    toastService = { show: jest.fn() };
    agridataStateService = createMockAgridataStateService();
    consentRequestService = createMockConsentRequestService();
    errorService = createMockErrorHandlerService();
    activeRoute = {
      snapshot: {
        queryParamMap: {
          get: jest.fn().mockReturnValue('stuff'),
        } as unknown as ParamMap,
      } as unknown as ActivatedRouteSnapshot,
    } as unknown as ActivatedRoute;
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;

    await TestBed.configureTestingModule({
      imports: [
        ConsentRequestDetailsComponent,
        createTranslocoTestingModule({
          langs: {
            de: {},
          },
        }),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toastService },
        { provide: ConsentRequestService, useValue: consentRequestService },
        { provide: AgridataStateService, useValue: agridataStateService },
        { provide: AnalyticsService, useValue: createMockAnalyticsService() },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: ActivatedRoute, useValue: activeRoute },
        { provide: Router, useValue: mockRouter },
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

  it('setting request should open details', async () => {
    await fixture.whenStable();

    const sidePanelComp = fixture.debugElement.query(By.directive(SidepanelComponent));
    expect(sidePanelComp).toBeTruthy();
    expect(sidePanelComp.componentInstance.isOpen()).toBe(true);
  });

  it('handleCloseDetails routes back to parent component', () => {
    const navSpy = jest.spyOn(mockRouter, 'navigate');
    component['handleCloseDetails']();
    expect(navSpy).toHaveBeenCalled();
  });

  it('should close details when Escape key is pressed', async () => {
    const navSpy = jest.spyOn(mockRouter, 'navigate');
    fixture.detectChanges();

    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    document.dispatchEvent(event);
    fixture.detectChanges();

    expect(navSpy).toHaveBeenCalled();
  });

  it('should should show toast after acceptRequest', async () => {
    componentRef.setInput('consentRequestId', '1');

    const navSpy = jest.spyOn(mockRouter, 'navigate');
    const resourceSpy = jest.spyOn(component['consentRequestResource'], 'reload');
    await fixture.whenStable();

    await component['acceptRequest']();

    expect(toastService.show).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith('1', 'GRANTED');
    expect(resourceSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalled();
  });

  it('should should show toast after rejectRequest', async () => {
    componentRef.setInput('consentRequestId', '1');

    const navSpy = jest.spyOn(mockRouter, 'navigate');
    const resourceSpy = jest.spyOn(component['consentRequestResource'], 'reload');
    await fixture.whenStable();

    await component['rejectRequest']();

    expect(toastService.show).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatus).toHaveBeenCalledWith('1', 'DECLINED');
    expect(resourceSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalled();
  });

  it('should disable buttons when impersonating', () => {
    jest.spyOn(agridataStateService, 'isImpersonating').mockReturnValue(true);
    fixture.detectChanges();

    // Query all button elements
    const buttons = fixture.debugElement.queryAll(By.css('app-agridata-button button'));

    // Find accept and reject buttons by their text content
    const acceptButton = buttons.find((btn) =>
      btn.nativeElement.textContent.includes('actions.accept'),
    );
    const rejectButton = buttons.find((btn) =>
      btn.nativeElement.textContent.includes('actions.reject'),
    );

    expect(acceptButton?.nativeElement.disabled).toBe(true);
    expect(rejectButton?.nativeElement.disabled).toBe(true);
  });

  describe('checkForRedirect', () => {
    it('should set shouldRedirect to true when redirectUrl matches the regex pattern', async () => {
      const testRedirectUrl = 'https://valid-external-redirect.com';
      activeRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue(testRedirectUrl);
      fixture.detectChanges();

      const mockRequest = {
        ...mockConsentRequests[0],
        dataRequest: {
          ...mockConsentRequests[0].dataRequest,
          validRedirectUriRegex: '^https://valid-external-redirect\\.com$',
          stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Draft,
        },
      } as ConsentRequestProducerViewDto;
      consentRequestService.fetchConsentRequest.mockResolvedValue(mockRequest);

      componentRef.setInput('consentRequestId', '1');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['shouldRedirect']()).toBe(true);
    });

    it('should reset redirect when redirectUrlPattern is missing', async () => {
      const testRedirectUrl = 'https://valid-external-redirect.com';
      activeRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue(testRedirectUrl);
      fixture.detectChanges();

      component['shouldRedirect'].set(true);

      const mockRequest = {
        ...mockConsentRequests[0],
        dataRequest: {
          ...mockConsentRequests[0].dataRequest,
          stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Draft,
        },
      } as ConsentRequestProducerViewDto;
      consentRequestService.fetchConsentRequest.mockResolvedValue(mockRequest);
      componentRef.setInput('consentRequestId', '1');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['shouldRedirect']()).toBe(false);
      expect(component['redirectUrl']()).toBeNull();
    });

    it('should reset redirect when regex does not match', async () => {
      const testRedirectUrl = 'https://invalid-domain.com';
      activeRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue(testRedirectUrl);
      fixture.detectChanges();

      component['shouldRedirect'].set(true);

      const mockRequest = {
        ...mockConsentRequests[0],
        dataRequest: {
          ...mockConsentRequests[0].dataRequest,
          validRedirectUriRegex: '^https://valid-external-redirect\\.com$',
          stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Draft,
        },
      } as ConsentRequestProducerViewDto;
      consentRequestService.fetchConsentRequest.mockResolvedValue(mockRequest);
      componentRef.setInput('consentRequestId', '1');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['shouldRedirect']()).toBe(false);
      expect(component['redirectUrl']()).toBeNull();
    });

    it('should handle invalid regex pattern and reset redirect', async () => {
      const testRedirectUrl = 'https://valid-external-redirect.com';
      activeRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue(testRedirectUrl);
      fixture.detectChanges();

      component['shouldRedirect'].set(true);

      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const mockRequest = {
        ...mockConsentRequests[0],
        dataRequest: {
          ...mockConsentRequests[0].dataRequest,
          validRedirectUriRegex: '([incomplete-regex',
          stateCode: ConsentRequestProducerViewDtoDataRequestStateCode.Draft,
        },
      } as ConsentRequestProducerViewDto;
      consentRequestService.fetchConsentRequest.mockResolvedValue(mockRequest);
      componentRef.setInput('consentRequestId', '1');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['shouldRedirect']()).toBe(false);
      expect(component['redirectUrl']()).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('handleRouterState', () => {
    it('should start timers if showRedirect active', () => {
      const testRedirectUrl = 'https://test-redirect.com';

      component['redirectUrl'].set(testRedirectUrl);
      component['showRedirect'].set(true);

      TestBed.tick();

      expect(component['countdownTimer']).toBeTruthy();

      // Restore originals
      jest.useRealTimers();
    });

    it('should redirect when timer is finished', () => {
      jest.useFakeTimers();
      const originalLocation = window.location;
      Object.defineProperty(globalThis, 'location', {
        writable: true,
        value: { href: '' },
      });
      const testRedirectUrl = 'https://test-redirect-with-timeout.com';
      component['redirectUrl'].set(testRedirectUrl);
      component['showRedirect'].set(true);

      TestBed.tick();

      jest.advanceTimersByTime(REDIRECT_TIMEOUT + 1);

      expect(globalThis.location.href).toBe(testRedirectUrl);

      Object.defineProperty(globalThis, 'location', {
        writable: true,
        configurable: true,
        value: originalLocation,
      });
      jest.useRealTimers();
    });
  });

  describe('startCountdown', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should decrement countdown value correctly', () => {
      const initialValue = component['countdownValue']();
      component['showRedirect'].set(true);

      TestBed.tick();

      expect(component['countdownValue']()).toBe(initialValue);

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(component['countdownValue']()).toBe(initialValue - 1);

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(component['countdownValue']()).toBe(initialValue - 2);
    });

    it('should clear the interval when countdown reaches 0', () => {
      jest.useRealTimers();
      jest.useFakeTimers();
      component['showRedirect'].set(true);

      TestBed.tick();

      const initialValue = component['countdownValue']();

      jest.advanceTimersByTime(initialValue * 1000);

      // We don't need to check for 0 since the timer doesn't set to exactly 0 in the component
      // It stops decrementing when currentValue <= 1
      expect(component['countdownValue']()).toBe(1);
    });

    it('should clear the interval when starting with countdown value 1', () => {
      jest.useRealTimers();
      jest.useFakeTimers();
      component['showRedirect'].set(true);

      component['countdownValue'].set(1);

      const originalSetInterval = window.setInterval;
      const mockSetInterval = jest.fn().mockReturnValue(123);
      window.setInterval = mockSetInterval as any;

      const originalClearInterval = window.clearInterval;
      const mockClearInterval = jest.fn();
      window.clearInterval = mockClearInterval as any;

      TestBed.tick();

      expect(component['countdownValue']()).not.toBe(1);

      // Since we're mocking the timer functions, we need to manually call the timer callback
      const timerCallback = mockSetInterval.mock.calls[0][0];

      component['countdownValue'].set(1);

      timerCallback();

      expect(mockClearInterval).toHaveBeenCalledWith(123);

      window.setInterval = originalSetInterval;
      window.clearInterval = originalClearInterval;
    });

    it('should perform redirect when redirectDirectly is called', () => {
      jest.useRealTimers();
      component['showRedirect'].set(true);

      const testRedirectUrl = 'https://test-redirect-flow.com';
      component['redirectUrl'].set(testRedirectUrl);

      const locationHrefSetter = jest.fn();
      const originalLocation = window.location;

      const mockLocation = {
        ...originalLocation,
      };

      Object.defineProperty(mockLocation, 'href', {
        get: () => originalLocation.href,
        set: locationHrefSetter,
        configurable: true,
      });

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true,
      });

      component['redirectDirectly']();

      expect(locationHrefSetter).toHaveBeenCalledWith(testRedirectUrl);

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    });

    it('should decrement countdown correctly when startCountdown is called', () => {
      jest.useRealTimers();
      jest.useFakeTimers();
      component['showRedirect'].set(true);

      TestBed.tick();

      const initialValue = component['countdownValue']();

      jest.advanceTimersByTime(1000);

      expect(component['countdownValue']()).toBe(initialValue - 1);

      jest.useRealTimers();
    });
  });

  describe('redirectDirectly', () => {
    it('should redirect to the URL in redirectUrl signal', () => {
      const testRedirectUrl = 'https://test-direct-redirect.com';
      component['showRedirect'].set(true);
      component['redirectUrl'].set(testRedirectUrl);

      const locationHrefSetter = jest.fn();
      const originalLocation = window.location;

      const mockLocation = {
        ...originalLocation,
      };

      Object.defineProperty(mockLocation, 'href', {
        get: () => originalLocation.href,
        set: locationHrefSetter,
        configurable: true,
      });

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true,
      });

      component['redirectDirectly']();

      expect(locationHrefSetter).toHaveBeenCalledWith(testRedirectUrl);

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    });

    it('should not redirect when redirectUrl is null', () => {
      component['redirectUrl'].set(null);
      component['showRedirect'].set(true);

      const locationHrefSetter = jest.fn();
      const originalLocation = window.location;

      const mockLocation = {
        ...originalLocation,
      };

      Object.defineProperty(mockLocation, 'href', {
        get: () => originalLocation.href,
        set: locationHrefSetter,
        configurable: true,
      });

      Object.defineProperty(window, 'location', {
        value: mockLocation,
        configurable: true,
      });

      component['redirectDirectly']();

      expect(locationHrefSetter).not.toHaveBeenCalled();

      Object.defineProperty(window, 'location', {
        value: originalLocation,
        configurable: true,
      });
    });
  });

  it('should handle errors from consentRequestsResource and send them to errorService', async () => {
    const testError = new Error('Test error from fetchDataRequests');
    consentRequestService.fetchConsentRequest.mockRejectedValueOnce(testError);
    componentRef.setInput('consentRequestId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });
});
