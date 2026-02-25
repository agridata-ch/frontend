import { afterEveryRender, Injector } from '@angular/core';
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
  injector: Injector,
): DriveStep[] {
  return [
    {
      element: '#consent-requests-table-row-0',
      popover: {
        description: i18nService.translate(
          'product-tour.consentRequestsTour.consentRequests.description',
        ),
        title: i18nService.translate('product-tour.consentRequestsTour.consentRequests.title'),
        onNextClick: (_element, _step, opts) => {
          const element = document.querySelector<HTMLElement>('#consent-requests-table-row-0');
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

function moveNextWhenReady(selector: string, moveNext: () => void, injector: Injector): void {
  const ref = afterEveryRender(
    () => {
      if (!document.querySelector(selector)) return;
      ref.destroy();
      moveNext();
    },
    { injector },
  );
}
