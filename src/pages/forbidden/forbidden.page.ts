import { Component } from '@angular/core';

import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Displays a simple 403 error message when users navigate to forbidden routes.
 *
 * CommentLastReviewed: 2025-10-27
 */
@Component({
  selector: 'app-forbidden',
  imports: [ButtonComponent, I18nPipe],
  templateUrl: './forbidden.page.html',
})
export class ForbiddenPage {
  protected readonly ButtonVariants = ButtonVariants;
}
