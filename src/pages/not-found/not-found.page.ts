import { Component } from '@angular/core';

import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Displays a simple 404 error message when users navigate to invalid routes.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-not-found',
  imports: [I18nPipe, ButtonComponent],
  templateUrl: './not-found.page.html',
})
export class NotFoundPage {
  protected readonly ButtonVariants = ButtonVariants;
}
