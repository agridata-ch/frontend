import { Component, computed, inject } from '@angular/core';
import { faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorAlertList } from '@/shared/error-alert-list/error-alert-list.component';
import { I18nPipe } from '@/shared/i18n';
import { ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal/modal.component';

/**
 * Displays a list of error messages to the user. It retrieves errors from the
 * ErrorHandlerService and provides a way to clear them. This component is useful
 * for notifying users of issues that occur during their interaction with the application.
 *
 * CommentLastReviewed: 2025-10-14
 */
@Component({
  selector: 'app-error-modal',
  imports: [ModalComponent, ErrorAlertList, I18nPipe],
  templateUrl: './error-modal.component.html',
})
export class ErrorModal {
  private readonly errorService = inject(ErrorHandlerService);
  private readonly stateService = inject(AgridataStateService);
  private readonly DONT_SHOW_ERROR_ON_ROUTES = [
    ROUTE_PATHS.ERROR,
    ROUTE_PATHS.MAINTENANCE,
    ROUTE_PATHS.FORBIDDEN,
    ROUTE_PATHS.NOT_FOUND,
  ];
  readonly errors = this.errorService.getGlobalErrors();

  dontShowErrors = computed(() => {
    const route = this.stateService.currentRouteWithoutQueryParams();
    if (!route) {
      return true;
    }
    return this.DONT_SHOW_ERROR_ON_ROUTES.some((r) => route.endsWith(r));
  });

  closeErrors() {
    this.errorService.markAllGlobalAsHandled();
  }

  protected readonly closeIcon = faClose;
  protected readonly ButtonVariants = ButtonVariants;
}
