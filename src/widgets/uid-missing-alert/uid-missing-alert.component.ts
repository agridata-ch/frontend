import { Component, computed, inject } from '@angular/core';

import { I18nService } from '@/shared/i18n';
import { AlertComponent, AlertType } from '@/shared/ui/alert';

/**
 * Warns producer pages that the user's UID is missing and points to the support phone number.
 * Callers render it only while `uidMissing()` is true.
 *
 * CommentLastReviewed: 2026-11-27
 */
@Component({
  selector: 'app-uid-missing-alert',
  imports: [AlertComponent],
  templateUrl: './uid-missing-alert.component.html',
})
export class UidMissingAlertComponent {
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly AlertType = AlertType;

  // Signals
  private readonly phoneNumber = this.i18nService.translateSignal('support-info.phoneNumber');

  // Computed Signals
  protected readonly uidMissingWarning = computed(() => {
    const phoneNumber = this.phoneNumber();
    return phoneNumber
      ? this.i18nService.translate('producer.uidMissingWarning', { phoneNumber })
      : '';
  });
}
