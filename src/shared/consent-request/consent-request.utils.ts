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
  const ref: ReturnType<typeof afterEveryRender> = afterEveryRender(
    () => {
      const element = document.querySelector(selector);
      if (!element) return;
      ref.destroy();
      waitForStablePosition(element).then(() => moveNext());
    },
    { injector },
  );
}

function waitForStablePosition(element: Element, maxFrames = 120): Promise<void> {
  return new Promise((resolve) => {
    // Two rAF skips before measuring: the first ensures Angular's DOM changes
    // are painted so CSS transitions have a chance to start; the second gives
    // us a base measurement taken after the transition is in motion.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        let prev = element.getBoundingClientRect().left;
        let stableFrames = 0;
        let totalFrames = 0;

        function checkFrame() {
          const rect = element.getBoundingClientRect();
          const current = rect.left;
          totalFrames++;

          // The element may live inside a ng-content-projected sidepanel that starts
          // with w-0 (overflow:hidden, fixed right-0). When the panel is closed its
          // children sit at left ≈ window.innerWidth — visually clipped but still
          // present in the DOM. Only consider the position stable once the element
          // is actually inside the visible viewport.
          const isInViewport = rect.left < window.innerWidth;

          if (isInViewport && Math.abs(current - prev) < 0.5) {
            stableFrames++;
          } else {
            stableFrames = 0;
            prev = current;
          }

          if ((isInViewport && stableFrames >= 2) || totalFrames >= maxFrames) {
            resolve();
          } else {
            requestAnimationFrame(checkFrame);
          }
        }

        requestAnimationFrame(checkFrame);
      });
    });
  });
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
