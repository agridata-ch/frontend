import { afterEveryRender, EnvironmentInjector } from '@angular/core';
import { DriveStep } from 'driver.js';

import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ToastType } from '@/shared/toast';

import { I18nService } from '../i18n';

export function getToastTitle(stateCode: string) {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return 'consent-request.toast.title.GRANTED';
    case ConsentRequestStateEnum.Declined:
      return 'consent-request.toast.title.DECLINED';
    default:
      return 'consent-request.toast.title.DEFAULT';
  }
}

export function getToastMessage(stateCode: string) {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return 'consent-request.toast.message.GRANTED';
    case ConsentRequestStateEnum.Declined:
      return 'consent-request.toast.message.DECLINED';
    default:
      return 'consent-request.toast.message.DEFAULT';
  }
}

export function getToastType(stateCode: string) {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return ToastType.Success;
    case ConsentRequestStateEnum.Declined:
      return ToastType.Error;
    default:
      return ToastType.Info;
  }
}

export function getUndoAction(undoAction: () => void) {
  return {
    label: 'consent-request.toast.undo',
    callback: undoAction,
  };
}

export function buildConsentRequestTourSteps(
  i18nService: I18nService,
  injector: EnvironmentInjector,
): DriveStep[] {
  return [
    {
      element: () => getTableOrListElement(),
      popover: {
        description: i18nService.translate(
          'product-tour.consentRequestsTour.consentRequests.description',
        ),
        title: i18nService.translate('product-tour.consentRequestsTour.consentRequests.title'),
        onNextClick: (_element, _step, opts) => {
          const element = getTableOrListElement();
          element?.click();
          moveNextWhenReady(
            '#data-request-purpose-accordion',
            opts.driver.moveNext.bind(opts.driver),
            injector,
          );
        },
      },
    },
    {
      element: '#data-request-purpose-accordion',
      popover: {
        description: i18nService.translate(
          'product-tour.consentRequestsTour.dataRequestPurpose.description',
        ),
        title: i18nService.translate('product-tour.consentRequestsTour.dataRequestPurpose.title'),
      },
    },
    {
      element: '#consent-request-footer',
      popover: {
        description: i18nService.translate(
          'product-tour.consentRequestsTour.consentRequestConsent.description',
        ),
        title: i18nService.translate(
          'product-tour.consentRequestsTour.consentRequestConsent.title',
        ),
      },
    },
  ];
}

function moveNextWhenReady(
  selector: string,
  moveNext: () => void,
  injector: EnvironmentInjector,
): void {
  const ref = afterEveryRender(
    () => {
      const element = document.querySelector(selector);
      if (!element) return;
      ref.destroy();
      // Wait one rAF so any CSS transitions triggered by this render have started,
      // then wait for all animations on the element and its ancestors to finish
      // before letting driver.js calculate the popover position.
      requestAnimationFrame(() => waitForAnimations(element).then(() => moveNext()));
    },
    { injector },
  );
}

function waitForAnimations(element: Element): Promise<void> {
  const animations: Animation[] = [];
  let current: Element | null = element;

  while (current) {
    animations.push(...current.getAnimations());
    current = current.parentElement;
  }

  if (animations.length === 0) {
    return Promise.resolve();
  }

  // allSettled so cancelled/interrupted animations don't block the tour
  return Promise.allSettled(animations.map((a) => a.finished)).then(() => undefined);
}

function getTableOrListElement(): HTMLElement {
  const tableElement = document.querySelector<HTMLElement>('#consent-requests-table-row-0');
  const listElement = document.querySelector<HTMLElement>('#consent-requests-list-item-0');

  // Return whichever is visible (not hidden by Tailwind responsive classes)
  if (tableElement && isElementVisible(tableElement)) {
    return tableElement;
  }
  if (listElement && isElementVisible(listElement)) {
    return listElement;
  }

  return tableElement ?? listElement ?? document.body;
}

function isElementVisible(element: HTMLElement): boolean {
  const style = globalThis.getComputedStyle(element);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    Number.parseFloat(style.opacity) !== 0 &&
    element.offsetParent !== null
  );
}
