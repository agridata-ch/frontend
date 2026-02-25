import { TestBed } from '@angular/core/testing';

import { ConsentRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks/mock-i18n-service';
import { ToastType } from '@/shared/toast';

import {
  buildConsentRequestTourSteps,
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from './consent-request.utils';

describe('Toast Utilities', () => {
  describe('getToastTitle()', () => {
    it('returns "consent-request.toast.title.GRANTED" for Granted', () => {
      const title = getToastTitle(ConsentRequestStateEnum.Granted);
      expect(title).toBe('consent-request.toast.title.GRANTED');
    });

    it('returns "consent-request.toast.title.DECLINED" for Declined', () => {
      const title = getToastTitle(ConsentRequestStateEnum.Declined);
      expect(title).toBe('consent-request.toast.title.DECLINED');
    });

    it('returns default title for any other state', () => {
      const title1 = getToastTitle('SomeOtherState');
      expect(title1).toBe('consent-request.toast.title.DEFAULT');

      const title2 = getToastTitle('');
      expect(title2).toBe('consent-request.toast.title.DEFAULT');
    });
  });

  describe('getToastMessage()', () => {
    it('returns Granted key', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Granted);
      expect(msg).toBe('consent-request.toast.message.GRANTED');
    });

    it('returns Declined key', () => {
      const msg = getToastMessage(ConsentRequestStateEnum.Declined);
      expect(msg).toBe('consent-request.toast.message.DECLINED');
    });

    it('returns default message for any other state', () => {
      const msg1 = getToastMessage('UnknownState');
      expect(msg1).toBe('consent-request.toast.message.DEFAULT');

      const msg2 = getToastMessage('');
      expect(msg2).toBe('consent-request.toast.message.DEFAULT');
    });
  });

  describe('getToastType()', () => {
    it('returns ToastType.Success for Granted', () => {
      const type = getToastType(ConsentRequestStateEnum.Granted);
      expect(type).toBe(ToastType.Success);
    });

    it('returns ToastType.Error for Declined', () => {
      const type = getToastType(ConsentRequestStateEnum.Declined);
      expect(type).toBe(ToastType.Error);
    });

    it('returns ToastType.Info for any other state', () => {
      const type1 = getToastType('RandomState');
      expect(type1).toBe(ToastType.Info);

      const type2 = getToastType('');
      expect(type2).toBe(ToastType.Info);
    });
  });

  describe('getUndoAction()', () => {
    it('returns an object with the correct i18n label', () => {
      const result = getUndoAction(jest.fn());
      expect(result.label).toBe('consent-request.toast.undo');
    });

    it('calls the provided undoAction when callback is invoked', () => {
      const undoAction = jest.fn();
      const result = getUndoAction(undoAction);
      result.callback();
      expect(undoAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildConsentRequestTourSteps()', () => {
    let i18nService: MockI18nService;

    beforeEach(() => {
      i18nService = createMockI18nService();

      TestBed.configureTestingModule({
        providers: [{ provide: I18nService, useValue: i18nService }],
      });
    });

    it('should return exactly 3 steps', () => {
      const { Injector } = jest.requireActual('@angular/core') as typeof import('@angular/core');
      const injector = TestBed.inject(Injector);
      const steps = buildConsentRequestTourSteps(i18nService, injector);
      expect(steps).toHaveLength(3);
    });

    it('should target the correct element selectors', () => {
      const { Injector } = jest.requireActual('@angular/core') as typeof import('@angular/core');
      const injector = TestBed.inject(Injector);
      const steps = buildConsentRequestTourSteps(i18nService, injector);

      expect(steps[0].element).toBe('#consent-requests-table-row-0');
      expect(steps[1].element).toBe('#data-request-purpose-accordion');
      expect(steps[2].element).toBe('#consent-request-footer');
    });

    it('should translate all popover titles and descriptions', () => {
      const { Injector } = jest.requireActual('@angular/core') as typeof import('@angular/core');
      const injector = TestBed.inject(Injector);
      buildConsentRequestTourSteps(i18nService, injector);

      expect(i18nService.translate).toHaveBeenCalledWith(
        'product-tour.consentRequestsTour.consentRequests.title',
      );
      expect(i18nService.translate).toHaveBeenCalledWith(
        'product-tour.consentRequestsTour.consentRequests.description',
      );
      expect(i18nService.translate).toHaveBeenCalledWith(
        'product-tour.consentRequestsTour.dataRequestPurpose.title',
      );
      expect(i18nService.translate).toHaveBeenCalledWith(
        'product-tour.consentRequestsTour.dataRequestPurpose.description',
      );
      expect(i18nService.translate).toHaveBeenCalledWith(
        'product-tour.consentRequestsTour.consentRequestConsent.title',
      );
      expect(i18nService.translate).toHaveBeenCalledWith(
        'product-tour.consentRequestsTour.consentRequestConsent.description',
      );
    });

    it('should call element.click() in onNextClick of first step', () => {
      const { Injector } = jest.requireActual('@angular/core') as typeof import('@angular/core');
      const injector = TestBed.inject(Injector);
      const steps = buildConsentRequestTourSteps(i18nService, injector);

      const mockElement = document.createElement('div');
      mockElement.id = 'consent-requests-table-row-0';
      document.body.appendChild(mockElement);
      const clickSpy = jest.spyOn(mockElement, 'click');

      const moveNext = jest.fn();
      const opts = { driver: { moveNext } } as unknown as Parameters<
        NonNullable<(typeof steps)[0]['popover']['onNextClick']>
      >[2];

      steps[0].popover.onNextClick?.(null, null as never, opts);

      expect(clickSpy).toHaveBeenCalled();
      document.body.removeChild(mockElement);
    });
  });
});
