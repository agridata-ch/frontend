import { Component, computed, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faLock, faPenSquare, faRepeat } from '@fortawesome/pro-regular-svg-icons';

import { I18nPipe } from '@/shared/i18n';

/**
 * Implements the logic for displaying privacy sections. It defines consent, data protection,
 * and revocation as structured items, each with an icon, title, and description. It supports
 * localization and dynamically inserts the consumer’s name into descriptions.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-privacy-infos',
  imports: [I18nPipe, FontAwesomeModule],
  templateUrl: './data-request-privacy-infos.component.html',
})
export class DataRequestPrivacyInfosComponent {
  readonly dataConsumerName = input<string | null>();

  readonly editIcon = faPenSquare;
  readonly lockIcon = faLock;
  readonly repeatIcon = faRepeat;

  readonly privacySections = computed(() => {
    return [
      {
        icon: this.editIcon,
        title: 'data-request.privacy.consent.title',
        description: 'data-request.privacy.consent.description',
      },
      {
        icon: this.lockIcon,
        title: 'data-request.privacy.dataProtection.title',
        description: 'data-request.privacy.dataProtection.description',
        translationParams: { consumerName: this.dataConsumerName() },
      },
      {
        icon: this.repeatIcon,
        title: 'data-request.privacy.revocation.title',
        description: 'data-request.privacy.revocation.description',
      },
    ];
  });
}
