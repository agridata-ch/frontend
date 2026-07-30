import { Component, input } from '@angular/core';

import { I18nDirective, I18nFormatDirective } from '@/shared/i18n';

/**
 * Displays the privacy information of a data-request. It renders a static title and a description
 * in which the data consumer and the data provider are interpolated into the translated text.
 *
 * CommentLastReviewed: 2026-07-30
 */
@Component({
  selector: 'app-data-request-privacy-infos',
  imports: [I18nDirective, I18nFormatDirective],
  templateUrl: './data-request-privacy-infos.component.html',
})
export class DataRequestPrivacyInfosComponent {
  readonly consumerName = input<string>();
  readonly providerName = input<string>();
  readonly lang = input<string>();
}
