import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ErrorAlertList } from '@/shared/error-alert-list/error-alert-list.component';
import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent } from '@/shared/ui/button';

/**
 * A page that displays error messages to the user.
 * It retrieves errors from the ErrorHandlerService and provides a method to close them.
 *
 * CommentLastReviewed: 2025-10-08
 */
@Component({
  selector: 'app-error-page',
  imports: [I18nPipe, ButtonComponent, ErrorAlertList],
  templateUrl: './error-page.component.html',
})
export class ErrorPage {
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);
  errors = computed(() =>
    this.errorService
      .getAllErrors()()
      .filter((e) => !e.isHandled),
  );

  closeErrors() {
    this.errorService.markAllAsHandled();
  }

  back() {
    this.errorService.markAllAsHandled();
    this.router.navigate(['/']);
  }
}
