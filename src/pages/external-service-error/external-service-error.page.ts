import { Component } from '@angular/core';

import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Displays an error page when an external service the backend depends on is unavailable.
 *
 * CommentLastReviewed: 2026-04-15
 */
@Component({
  selector: 'app-external-service-error',
  imports: [ButtonComponent, I18nPipe],
  templateUrl: './external-service-error.page.html',
})
export class ExternalServiceErrorPage {
  protected readonly ButtonVariants = ButtonVariants;
}
