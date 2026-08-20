import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import {
  ConsentRequestAggregationDto,
  ConsentRequestAggregationStateEnum,
  ConsentRequestStateEnum,
} from '@/entities/openapi';
import { REDIRECT_TIMEOUT } from '@/pages/consent-request-producer/consent-request-producer.page.model';
import { SidepanelComponent } from '@/shared/sidepanel';
import {
  createMockActivatedRoute,
  MockActivatedRoute,
  createMockAgridataStateService,
  MockAgridataStateService,
  createMockAnalyticsService,
  createMockConsentRequestService,
  mockConsentRequestAggregations,
  MockConsentRequestService,
  createMockErrorHandlerService,
  MockErrorHandlerService,
  createMockMasterDataService,
  MockMasterDataService,
  createMockDocument,
  MockLocation,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService } from '@/shared/toast';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';
import { DataRequestContentComponent } from '@/widgets/data-request-content';

describe('ConsentRequestDetailsComponent', () => {
  let fixture: ComponentFixture<ConsentRequestDetailsComponent>;
  let component: ConsentRequestDetailsComponent;
  let componentRef: ComponentRef<ConsentRequestDetailsComponent>;
  let toastService: { show: jest.Mock };
  let consentRequestService: MockConsentRequestService;
  let agridataStateService: MockAgridataStateService;
  let errorService: MockErrorHandlerService;
  let mockRouter: Router;
  let activeRoute: MockActivatedRoute;
  let mockLocation: MockLocation;
  let masterDataService: MockMasterDataService;
  beforeEach(async () => {
    toastService = { show: jest.fn() };
    agridataStateService = createMockAgridataStateService();
    // the aggregation resource only fetches once a producer uid is active
    agridataStateService.__testSignals.activeUid.set('uid-1');
    consentRequestService = createMockConsentRequestService();
    errorService = createMockErrorHandlerService();
    activeRoute = createMockActivatedRoute();
    masterDataService = createMockMasterDataService();
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<Router>;
    const mockDocument = createMockDocument();
    mockLocation = mockDocument.location;

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
        { provide: MasterDataService, useValue: masterDataService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: ActivatedRoute, useValue: activeRoute },
        { provide: Router, useValue: mockRouter },
        mockDocument.provider,
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
    componentRef.setInput('aggregationId', 'dr-1');

    const navSpy = jest.spyOn(mockRouter, 'navigate');
    const resourceSpy = jest.spyOn(component['consentRequestResource'], 'reload');
    await fixture.whenStable();

    await component['acceptRequest']();

    expect(toastService.show).toHaveBeenCalled();
    // dr-1's only open consent request is id '1'
    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['1'],
      'GRANTED',
    );
    expect(resourceSpy).not.toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalled();
  });

  it('should should show toast after rejectRequest', async () => {
    componentRef.setInput('aggregationId', 'dr-1');

    const navSpy = jest.spyOn(mockRouter, 'navigate');
    const resourceSpy = jest.spyOn(component['consentRequestResource'], 'reload');
    await fixture.whenStable();

    await component['rejectRequest']();

    expect(toastService.show).toHaveBeenCalled();
    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['1'],
      'DECLINED',
    );
    expect(resourceSpy).not.toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalled();
  });

  it('updates the BUR child and ignores the UID child when BUR children exist', async () => {
    // dr-3: UID child '4' (opened) + BUR child '5' (opened)
    consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(
      mockConsentRequestAggregations[2],
    );
    componentRef.setInput('aggregationId', 'dr-3');
    await fixture.whenStable();

    await component['acceptRequest']();

    // only the BUR child is sent; the UID child ('4') is left to the backend
    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['5'],
      'GRANTED',
    );
  });

  it('updates every differing BUR child on accept, ignoring the UID child', async () => {
    // dr-4: UID granted '6', BUR declined '7', BUR opened '8'
    consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(
      mockConsentRequestAggregations[3],
    );
    componentRef.setInput('aggregationId', 'dr-4');
    await fixture.whenStable();

    await component['acceptRequest']();

    // both BUR children differ from GRANTED; the already-granted UID child is skipped
    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['7', '8'],
      'GRANTED',
    );
  });

  it('declines the BUR child of a granted aggregation, ignoring the UID child', async () => {
    // dr-2: UID granted '2', BUR granted '3'
    consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(
      mockConsentRequestAggregations[1],
    );
    componentRef.setInput('aggregationId', 'dr-2');
    await fixture.whenStable();

    await component['rejectRequest']();

    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['3'],
      'DECLINED',
    );
  });

  it('can accept an already declined consent request', async () => {
    consentRequestService.fetchConsentRequestAggregation.mockResolvedValue({
      id: 'dr-9',
      stateCode: ConsentRequestAggregationStateEnum.Declined,
      consentRequests: [{ id: '9', stateCode: ConsentRequestStateEnum.Declined }],
    });
    componentRef.setInput('aggregationId', 'dr-9');
    await fixture.whenStable();

    await component['acceptRequest']();

    expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
      ['9'],
      'GRANTED',
    );
  });

  describe('disables the action that would not change anything', () => {
    it('offers only reject when the acted-on child is already granted', async () => {
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue({
        id: 'dr-pg',
        stateCode: ConsentRequestAggregationStateEnum.PartiallyGranted,
        consentRequests: [
          { id: '10', stateCode: ConsentRequestStateEnum.Granted },
          { id: '11', stateCode: ConsentRequestStateEnum.Declined },
        ],
      });
      componentRef.setInput('aggregationId', 'dr-pg');
      await fixture.whenStable();

      expect(component['acceptDisabled']()).toBe(true);
      expect(component['rejectDisabled']()).toBe(false);

      await component['rejectRequest']();

      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
        ['10'],
        'DECLINED',
      );
    });

    it('offers only accept when the acted-on child is already declined', async () => {
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue({
        id: 'dr-pg',
        stateCode: ConsentRequestAggregationStateEnum.PartiallyGranted,
        consentRequests: [
          { id: '12', stateCode: ConsentRequestStateEnum.Declined },
          { id: '13', stateCode: ConsentRequestStateEnum.Granted },
        ],
      });
      componentRef.setInput('aggregationId', 'dr-pg');
      await fixture.whenStable();

      expect(component['rejectDisabled']()).toBe(true);
      expect(component['acceptDisabled']()).toBe(false);

      await component['acceptRequest']();

      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
        ['12'],
        'GRANTED',
      );
    });
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

    expect(acceptButton?.nativeElement.getAttribute('aria-disabled')).toBe('true');
    expect(rejectButton?.nativeElement.getAttribute('aria-disabled')).toBe('true');
  });

  describe('checkForRedirect', () => {
    it('should set shouldRedirect to true when redirectUrl matches the regex pattern', async () => {
      const testRedirectUrl = 'https://valid-external-redirect.com';
      activeRoute.snapshot.queryParamMap.get = jest.fn().mockReturnValue(testRedirectUrl);
      fixture.detectChanges();

      const mockRequest = {
        ...mockConsentRequestAggregations[0],
        dataRequest: {
          ...mockConsentRequestAggregations[0].dataRequest,
          validRedirectUriRegex: '^https://valid-external-redirect\\.com$',
        },
      } as ConsentRequestAggregationDto;
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(mockRequest);

      componentRef.setInput('aggregationId', '1');

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
        ...mockConsentRequestAggregations[0],
        dataRequest: {
          ...mockConsentRequestAggregations[0].dataRequest,
        },
      } as ConsentRequestAggregationDto;
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(mockRequest);
      componentRef.setInput('aggregationId', '1');

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
        ...mockConsentRequestAggregations[0],
        dataRequest: {
          ...mockConsentRequestAggregations[0].dataRequest,
          validRedirectUriRegex: '^https://valid-external-redirect\\.com$',
        },
      } as ConsentRequestAggregationDto;
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(mockRequest);
      componentRef.setInput('aggregationId', '1');

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
        ...mockConsentRequestAggregations[0],
        dataRequest: {
          ...mockConsentRequestAggregations[0].dataRequest,
          validRedirectUriRegex: '([incomplete-regex',
        },
      } as ConsentRequestAggregationDto;
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(mockRequest);
      componentRef.setInput('aggregationId', '1');

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
      const testRedirectUrl = 'https://test-redirect-with-timeout.com';
      component['redirectUrl'].set(testRedirectUrl);
      component['showRedirect'].set(true);

      TestBed.tick();

      jest.advanceTimersByTime(REDIRECT_TIMEOUT + 1);

      expect(mockLocation.href).toBe(testRedirectUrl);

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

      // The redirect timeout fires at the same instant as the countdown's final tick, so depending
      // on timer ordering the interval is cleared at 0 or 1. Either way the countdown must have run
      // to completion (<= 1, never negative) and then stopped (no further decrements).
      jest.advanceTimersByTime(initialValue * 1000);
      const valueAfterCountdown = component['countdownValue']();

      jest.advanceTimersByTime(initialValue * 1000);

      expect(valueAfterCountdown).toBeLessThanOrEqual(1);
      expect(component['countdownValue']()).toBe(valueAfterCountdown);
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

      component['redirectDirectly']();

      expect(mockLocation.href).toBe(testRedirectUrl);
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

      component['redirectDirectly']();

      expect(mockLocation.href).toBe(testRedirectUrl);
    });

    it('should not redirect when redirectUrl is null', () => {
      component['redirectUrl'].set(null);
      component['showRedirect'].set(true);

      component['redirectDirectly']();

      expect(mockLocation.href).toBe('');
    });
  });

  it('should handle errors from consentRequestsResource and send them to errorService', async () => {
    const testError = new Error('Test error from fetchDataRequests');
    consentRequestService.fetchConsentRequestAggregation.mockRejectedValueOnce(testError);
    componentRef.setInput('aggregationId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  it('should render the data request content of the loaded request', async () => {
    consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(
      mockConsentRequestAggregations[0] as ConsentRequestAggregationDto,
    );
    componentRef.setInput('aggregationId', '1');

    fixture.detectChanges();
    await fixture.whenStable();

    const content = fixture.debugElement.query(By.directive(DataRequestContentComponent));
    expect(content.componentInstance.dataRequest()).toEqual(
      mockConsentRequestAggregations[0].dataRequest,
    );
  });

  describe('per-BUR decisions (edit mode)', () => {
    beforeEach(async () => {
      // dr-4 has a granted+declined+opened mix, one global child (id '6') and two BUR children.
      consentRequestService.fetchConsentRequestAggregation.mockResolvedValue(
        mockConsentRequestAggregations[3] as ConsentRequestAggregationDto,
      );
      componentRef.setInput('aggregationId', 'dr-4');
      await fixture.whenStable();
    });

    it('feeds the aggregation children into the decision store', () => {
      expect(component['decisionStore'].consentRequests().map((request) => request.id)).toEqual([
        '6',
        '7',
        '8',
      ]);
    });

    it('submits only changed BUR children and never touches the UID child', async () => {
      component['decisionStore'].consentRequests.set([
        { id: 'uid', dataProducerUid: 'u', stateCode: ConsentRequestStateEnum.Opened },
        { id: 'bur-granted', dataProducerBur: '1', stateCode: ConsentRequestStateEnum.Granted },
        { id: 'bur-open', dataProducerBur: '2', stateCode: ConsentRequestStateEnum.Opened },
      ]);
      // bur-open (OPENED) seeds on -> becomes granted (a change); bur-granted stays on (no change)
      component['decisionStore'].startEdit();

      await component['saveBurDecisions']();

      // only the changed bur-open is sent; bur-granted is a no-op and the UID child is left alone
      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledTimes(1);
      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
        ['bur-open'],
        ConsentRequestStateEnum.Granted,
      );
      expect(component['decisionStore'].editMode()).toBe(false);
    });

    it('declines a BUR child toggled off, leaving the other BUR and the UID untouched', async () => {
      component['decisionStore'].consentRequests.set([
        { id: 'uid', dataProducerUid: 'u', stateCode: ConsentRequestStateEnum.Granted },
        { id: 'bur-1', dataProducerBur: '1', stateCode: ConsentRequestStateEnum.Granted },
        { id: 'bur-2', dataProducerBur: '2', stateCode: ConsentRequestStateEnum.Granted },
      ]);
      component['decisionStore'].startEdit();
      component['decisionStore'].setDecision('bur-1', false);

      await component['saveBurDecisions']();

      // only the flipped bur-1 is declined; bur-2 (unchanged) and the UID child are not sent
      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledTimes(1);
      expect(consentRequestService.updateConsentRequestStatuses).toHaveBeenCalledWith(
        ['bur-1'],
        ConsentRequestStateEnum.Declined,
      );
    });

    it('makes no service call when nothing changed and leaves edit mode', async () => {
      component['decisionStore'].consentRequests.set([
        { id: 'uid', dataProducerUid: 'u', stateCode: ConsentRequestStateEnum.Granted },
        { id: 'bur', dataProducerBur: '1', stateCode: ConsentRequestStateEnum.Declined },
      ]);
      component['decisionStore'].startEdit();

      await component['saveBurDecisions']();

      expect(consentRequestService.updateConsentRequestStatuses).not.toHaveBeenCalled();
      expect(component['decisionStore'].editMode()).toBe(false);
    });

    it('keeps edit mode and staged decisions when the save fails', async () => {
      consentRequestService.updateConsentRequestStatuses.mockRejectedValueOnce(
        new Error('save failed'),
      );
      component['decisionStore'].startEdit();

      await component['saveBurDecisions']();

      expect(errorService.handleError).toHaveBeenCalled();
      expect(component['decisionStore'].editMode()).toBe(true);
    });

    it('cancelEdit discards staged decisions without calling the service', () => {
      component['decisionStore'].startEdit();
      component['decisionStore'].setDecision('8', true);

      component['cancelEdit']();

      expect(component['decisionStore'].editMode()).toBe(false);
      expect(component['decisionStore'].decisions()).toEqual({});
    });
  });
});
