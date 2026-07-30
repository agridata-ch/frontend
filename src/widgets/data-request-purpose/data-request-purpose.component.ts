import { Component, computed, inject, input } from '@angular/core';

import { DataRequestPurposeDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';

/**
 * Implements the logic to show the purpose of the data-request.
 *
 * CommentLastReviewed: 2026-08-03
 */
@Component({
  selector: 'app-data-request-purpose',
  imports: [I18nDirective],
  templateUrl: './data-request-purpose.component.html',
})
export class DataRequestPurposeComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Inputs
  readonly purpose = input<DataRequestPurposeDto>();
  readonly consumerName = input<string>();
  readonly lang = input<string>();

  // Computed Signals
  protected readonly translatedPurpose = computed(() =>
    this.i18nService.useObjectTranslation(this.purpose(), this.lang()),
  );
}
