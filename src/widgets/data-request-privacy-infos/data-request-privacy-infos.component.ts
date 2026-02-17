import { Component, computed, inject, input } from '@angular/core';
import {
  faFileSignature,
  faLockKeyhole,
  faRotate,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataProviderDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';

/**
 * Implements the logic for displaying privacy sections. It defines consent, data protection,
 * and revocation as structured items, each with an icon, title, and description. It supports
 * localization and dynamically inserts the consumer’s name into descriptions.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-privacy-infos',
  imports: [FontAwesomeModule, I18nDirective],
  templateUrl: './data-request-privacy-infos.component.html',
})
export class DataRequestPrivacyInfosComponent {
  readonly i18nService = inject(I18nService);

  readonly dataConsumerName = input<string | null>();
  readonly dataProvider = input<DataProviderDto>();
  readonly lang = input<string>();

  readonly editIcon = faFileSignature;
  readonly lockIcon = faLockKeyhole;
  readonly repeatIcon = faRotate;

  readonly privacySections = computed(() => {
    return [
      {
        icon: this.editIcon,
        title: 'data-request.privacy.consent.title',
        description: 'data-request.privacy.consent.description',
        translationParams: { consumerName: this.dataConsumerName() },
      },
      {
        icon: this.lockIcon,
        title: 'data-request.privacy.dataProtection.title',
        description: 'data-request.privacy.dataProtection.description',
        translationParams: {
          systemName: this.i18nService.useObjectTranslation(this.dataProvider()?.name, this.lang()),
          consumerName: this.dataConsumerName(),
        },
      },
      {
        icon: this.repeatIcon,
        title: 'data-request.privacy.revocation.title',
        description: 'data-request.privacy.revocation.description',
      },
    ];
  });
}
