import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { environment } from '@/environments/environment';
import { I18nDirective } from '@/shared/i18n';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';

/**
 * An empty state component specifically designed for consent-requests.
 *
 * CommentLastReviewed: 2026-01-27
 */
@Component({
  selector: 'app-consent-request-empty-state',
  imports: [I18nDirective, FontAwesomeModule, EmptyStateComponent],
  templateUrl: './consent-request-empty-state.component.html',
})
export class ConsentRequestEmptyStateComponent {
  protected readonly appBaseUrl = environment.appBaseUrl;
}
