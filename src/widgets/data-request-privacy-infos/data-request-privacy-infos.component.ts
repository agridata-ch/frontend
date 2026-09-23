import { Component, computed, inject, input } from '@angular/core';

import { I18nDirective, I18nFormatDirective, I18nService } from '@/shared/i18n';
import { AlertComponent, AlertType } from '@/shared/ui/alert';

/**
 * Displays the privacy information of a data-request. It renders a static title and a description
 * in which the data consumer and the data provider are interpolated into the translated text.
 *
 * CommentLastReviewed: 2026-07-30
 */
@Component({
  selector: 'app-data-request-privacy-infos',
  imports: [AlertComponent, I18nDirective, I18nFormatDirective],
  templateUrl: './data-request-privacy-infos.component.html',
})
export class DataRequestPrivacyInfosComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly AlertType = AlertType;

  // Input properties
  readonly consumerName = input<string>();
  readonly providerName = input<string>();
  readonly lang = input<string>();
  readonly dataConsumerCity = input<string>();
  readonly dataConsumerCountry = input<string>();
  readonly isForeignConsumer = input<boolean>(false);

  // Computed Signals
  protected readonly countryDisplayName = computed(() => {
    const country = this.dataConsumerCountry();
    if (!country) return '';
    const lang = this.lang() ?? this.i18nService.lang();
    return new Intl.DisplayNames([lang], { type: 'region' }).of(country) ?? country;
  });
}
