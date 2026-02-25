import { Component, inject, Injector } from '@angular/core';
import { faArrowProgress } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DriveStep } from 'driver.js';

import { buildConsentRequestTourSteps } from '@/shared/consent-request';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ProductTourService } from '@/shared/product-tour/product-tour.service';
import { ButtonVariants } from '@/shared/ui/button';

/**
 * A button that triggers a driver.js guided tour when clicked.
 * Accepts tour steps as input.
 *
 * CommentLastReviewed: 2026-02-25
 */
@Component({
  selector: 'app-consent-requests-tour-trigger',
  imports: [FontAwesomeModule, I18nDirective],
  templateUrl: './consent-requests-tour-trigger.component.html',
})
export class ConsentRequestsTourTriggerComponent {
  // Injects
  private readonly i18nService = inject(I18nService);
  private readonly injector = inject(Injector);
  private readonly productTourService = inject(ProductTourService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly progressIcon = faArrowProgress;

  protected startTour() {
    const steps: DriveStep[] = buildConsentRequestTourSteps(this.i18nService, this.injector);
    this.productTourService.start(steps);
  }
}
