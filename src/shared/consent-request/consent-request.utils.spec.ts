import { ApplicationRef, EnvironmentInjector } from '@angular/core';
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
      const injector = TestBed.inject(EnvironmentInjector);
      const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);
      expect(steps).toHaveLength(3);
    });

    it('should target the correct element selectors', () => {
      const injector = TestBed.inject(EnvironmentInjector);
      const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);

      expect(typeof steps[0].element).toBe('function');
      expect(steps[1].element).toBe('#data-request-purpose-accordion');
      expect(steps[2].element).toBe('#consent-request-footer');
    });

    it('should translate all popover titles and descriptions', () => {
      const injector = TestBed.inject(EnvironmentInjector);
      buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);

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
      const injector = TestBed.inject(EnvironmentInjector);
      const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);

      const mockElement = document.createElement('div');
      mockElement.id = 'consent-requests-table-row-0';
      mockElement.style.display = 'block';
      mockElement.style.visibility = 'visible';
      mockElement.style.opacity = '1';
      document.body.appendChild(mockElement);
      const clickSpy = jest.spyOn(mockElement, 'click');

      const moveNext = jest.fn();
      const opts = { driver: { moveNext } } as unknown as Parameters<
        NonNullable<NonNullable<(typeof steps)[0]['popover']>['onNextClick']>
      >[2];

      steps[0].popover?.onNextClick?.(mockElement, null as never, opts);

      expect(clickSpy).toHaveBeenCalled();
      mockElement.remove();
    });

    it('should resolve table element when both table and list elements exist and table is visible', () => {
      // Clean DOM first
      document
        .querySelectorAll('#consent-requests-table-row-0, #consent-requests-list-item-0')
        .forEach((el) => el.remove());

      const injector = TestBed.inject(EnvironmentInjector);
      const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);

      const tableElement = document.createElement('div');
      tableElement.id = 'consent-requests-table-row-0';
      tableElement.style.display = 'block';
      tableElement.style.visibility = 'visible';
      tableElement.style.opacity = '1';
      document.body.appendChild(tableElement);

      const listElement = document.createElement('div');
      listElement.id = 'consent-requests-list-item-0';
      listElement.style.display = 'block';
      listElement.style.visibility = 'visible';
      listElement.style.opacity = '1';
      document.body.appendChild(listElement);

      const resolvedElement = (steps[0].element as () => HTMLElement)();

      expect(resolvedElement).toBe(tableElement);
      tableElement.remove();
      listElement.remove();
    });

    it('should resolve to document.body when neither table nor list element is visible', () => {
      // Clean up any leftover elements from previous tests
      document
        .querySelectorAll('#consent-requests-table-row-0, #consent-requests-list-item-0')
        .forEach((el) => el.remove());

      const injector = TestBed.inject(EnvironmentInjector);
      const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);

      const resolvedElement = (steps[0].element as () => HTMLElement)();

      expect(resolvedElement).toBe(document.body);
    });
  });
});

describe('moveNextWhenReady (via onNextClick)', () => {
  type OnNextClickOpts = Parameters<
    NonNullable<
      NonNullable<ReturnType<typeof buildConsentRequestTourSteps>[0]['popover']>['onNextClick']
    >
  >[2];

  let i18nService: MockI18nService;
  let injector: EnvironmentInjector;
  let appRef: ApplicationRef;
  let accordion: HTMLDivElement;

  beforeEach(() => {
    i18nService = createMockI18nService();

    TestBed.configureTestingModule({
      providers: [{ provide: I18nService, useValue: i18nService }],
    });

    injector = TestBed.inject(EnvironmentInjector);
    appRef = TestBed.inject(ApplicationRef);

    accordion = document.createElement('div');
    accordion.id = 'data-request-purpose-accordion';
    document.body.appendChild(accordion);

    // jsdom does not implement getAnimations; define a configurable stub so we can override per-test
    Object.defineProperty(Element.prototype, 'getAnimations', {
      configurable: true,
      writable: true,
      value: jest.fn().mockReturnValue([]),
    });
  });

  afterEach(() => {
    accordion.remove();
    delete (Element.prototype as Partial<typeof Element.prototype>).getAnimations;
    jest.restoreAllMocks();
  });

  it('should call moveNext after element appears and has no animations', async () => {
    const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);
    const moveNext = jest.fn();
    const opts = { driver: { moveNext } } as unknown as OnNextClickOpts;

    // Register the afterEveryRender hook using the real (async) rAF so Angular's
    // internal scheduler is not made synchronous during registration.
    steps[0].popover?.onNextClick?.(accordion, null as never, opts);

    // Only now make rAF synchronous so the implementation's rAF call fires
    // immediately when appRef.tick() runs the afterEveryRender callback.
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    appRef.tick();
    await Promise.resolve(); // flush waitForAnimations microtask

    expect(moveNext).toHaveBeenCalledTimes(1);
  });

  it('should wait for all animations to settle before calling moveNext', async () => {
    let resolveAnimation!: () => void;
    const animationFinished = new Promise<Animation>(
      (res) => (resolveAnimation = () => res({} as Animation)),
    );
    (Element.prototype.getAnimations as jest.Mock).mockReturnValue([
      { finished: animationFinished } as unknown as Animation,
    ]);

    const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);
    const moveNext = jest.fn();
    const opts = { driver: { moveNext } } as unknown as OnNextClickOpts;

    steps[0].popover?.onNextClick?.(accordion, null as never, opts);

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    appRef.tick();
    await Promise.resolve();

    // Animation still running — moveNext must not have been called yet
    expect(moveNext).not.toHaveBeenCalled();

    resolveAnimation();
    await Promise.resolve(); // allSettled resolves
    await Promise.resolve(); // .then(() => undefined) resolves
    await Promise.resolve(); // .then(() => moveNext()) resolves

    expect(moveNext).toHaveBeenCalledTimes(1);
  });

  it('should call moveNext even when an animation is cancelled (rejected)', async () => {
    const rejectedAnimation = Promise.reject(new Error('animation cancelled'));
    // Attach a no-op catch so Jest doesn't treat this as an unhandled rejection;
    // the implementation uses Promise.allSettled which handles it gracefully.
    void rejectedAnimation.catch(() => {});
    (Element.prototype.getAnimations as jest.Mock).mockReturnValue([
      { finished: rejectedAnimation } as unknown as Animation,
    ]);

    const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);
    const moveNext = jest.fn();
    const opts = { driver: { moveNext } } as unknown as OnNextClickOpts;

    steps[0].popover?.onNextClick?.(accordion, null as never, opts);

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    appRef.tick();

    await Promise.allSettled([rejectedAnimation]);
    await Promise.resolve();
    await Promise.resolve();

    expect(moveNext).toHaveBeenCalledTimes(1);
  });

  it('should not call moveNext before the element is present in the DOM', async () => {
    accordion.remove();

    const steps = buildConsentRequestTourSteps(i18nService as unknown as I18nService, injector);
    const moveNext = jest.fn();
    const opts = { driver: { moveNext } } as unknown as OnNextClickOpts;

    steps[0].popover?.onNextClick?.(document.body, null as never, opts);

    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });

    appRef.tick();
    await Promise.resolve();

    expect(moveNext).not.toHaveBeenCalled();

    // Restore element so afterEach cleanup doesn't throw
    document.body.appendChild(accordion);
  });
});
