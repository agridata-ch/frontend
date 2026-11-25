import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorAlertList } from '@/shared/error-alert-list/error-alert-list.component';
import { I18nPipe } from '@/shared/i18n';
import { getRedirectUri } from '@/shared/lib/redirect-uri.helper';
import { ButtonComponent } from '@/shared/ui/button';
import { ReturnToAppComponent } from '@/shared/ui/return-to-app';

/**
 * A page that displays error messages to the user.
 * It retrieves errors from the ErrorHandlerService and provides a method to close them. When the
 * page was reached from an invitation link with a redirect_uri, it offers a (unverified) return to
 * the data consumer's application.
 *
 * CommentLastReviewed: 2026-11-25
 */
@Component({
  selector: 'app-error-page',
  imports: [ButtonComponent, ErrorAlertList, I18nPipe, ReturnToAppComponent],
  templateUrl: './error-page.component.html',
})
export class ErrorPage {
  // Injects
  private readonly errorService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Constants
  protected readonly redirectUri = getRedirectUri(this.route.snapshot);

  // Computed Signals
  protected readonly errors = computed(() =>
    this.errorService
      .getAllErrors()()
      .filter((e) => !e.isHandled),
  );

  protected back(): void {
    this.errorService.markAllAsHandled();
    this.router.navigate(['/']);
  }

  protected closeErrors(): void {
    this.errorService.markAllAsHandled();
  }
}
