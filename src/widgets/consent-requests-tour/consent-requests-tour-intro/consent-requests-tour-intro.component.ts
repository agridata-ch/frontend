import { Component, inject, Injector, output, signal } from '@angular/core';

import { buildConsentRequestTourSteps } from '@/shared/consent-request';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ProductTourService } from '@/shared/product-tour';
import { ButtonVariants, ButtonComponent } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal/modal.component';

/**
 * Displays an intro modal asking the user to start or skip the consent request tour.
 *
 * CommentLastReviewed: 2026-03-02
 */
@Component({
  selector: 'app-consent-requests-tour-intro',
  imports: [ModalComponent, I18nDirective, ButtonComponent],
  templateUrl: './consent-requests-tour-intro.component.html',
})
export class ConsentRequestsTourIntroComponent {
  private readonly i18nService = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly productTourService = inject(ProductTourService);

  protected readonly skipTourCallback = output();

  protected readonly showModal = signal(true);

  protected readonly ButtonVariants = ButtonVariants;

  protected closeTourIntro() {
    this.showModal.set(false);
    this.skipTourCallback.emit();
  }

  protected startTour() {
    this.showModal.set(false);
    this.productTourService.start(buildConsentRequestTourSteps(this.i18nService, this.injector));
  }
}
