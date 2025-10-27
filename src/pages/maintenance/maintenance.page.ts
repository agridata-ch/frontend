import { Component } from '@angular/core';

import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Displays a simple 404 error message when users navigate to invalid routes.
 *
 * CommentLastReviewed: 2025-10-27
 */
@Component({
  selector: 'app-maintenance',
  imports: [I18nPipe, ButtonComponent],
  templateUrl: './maintenance.page.html',
})
export class MaintenancePage {
  protected readonly ButtonVariants = ButtonVariants;
}
