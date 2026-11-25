import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { I18nPipe } from '@/shared/i18n/i18n.pipe';
import { getRedirectUri } from '@/shared/lib/redirect-uri.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ReturnToAppComponent } from '@/shared/ui/return-to-app';

/**
 * Displays an error page when an external service the backend depends on is unavailable. Offers a
 * return to the data consumer's application when the invitation link carried a redirect_uri.
 *
 * CommentLastReviewed: 2026-11-25
 */
@Component({
  selector: 'app-external-service-error',
  imports: [ButtonComponent, I18nPipe, ReturnToAppComponent],
  templateUrl: './external-service-error.page.html',
})
export class ExternalServiceErrorPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly redirectUri = getRedirectUri(this.route.snapshot);
}
