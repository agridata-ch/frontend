import { inject, Injectable, signal } from '@angular/core';
import { driver, type Config, type DriveStep } from 'driver.js';

import { I18nService } from '@/shared/i18n';

/**
 * Manages application tours using driver.js. Provides methods to start, stop
 * and configure guided tours across pages.
 *
 * CommentLastReviewed: 2026-02-25
 */
@Injectable({
  providedIn: 'root',
})
export class ProductTourService {
  readonly i18nService = inject(I18nService);

  readonly isActive = signal<boolean>(false);

  start(steps: DriveStep[], config?: Partial<Config>) {
    const driverInstance = driver({
      animate: true,
      smoothScroll: true,
      disableActiveInteraction: true,
      steps: steps,
      showProgress: true,
      popoverClass: 'driver-product-tour-theme',
      nextBtnText: this.i18nService.translate('product-tour.nextBtnText'),
      doneBtnText: this.i18nService.translate('product-tour.doneBtnText'),
      showButtons: ['next'],
      onDestroyed: (element, step, opts) => {
        this.isActive.set(false);
        config?.onDestroyed?.(element, step, opts);
      },
      onPopoverRender: (popover, options) => {
        const activeIndex = (options.state.activeIndex ?? 0) + 1;
        const total = steps.length;

        const progressEl = popover.wrapper.querySelector<HTMLElement>(
          '.driver-popover-progress-text',
        );

        if (progressEl) {
          progressEl.textContent = this.i18nService.translate('product-tour.progressText', {
            current: activeIndex,
            total,
          });
        }

        config?.onPopoverRender?.(popover, options);
      },
      popoverOffset: 20,
      ...config,
    });
    this.isActive.set(true);
    driverInstance.drive();
  }

  stop() {
    this.isActive.set(false);
  }
}
