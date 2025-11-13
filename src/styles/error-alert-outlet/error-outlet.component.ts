import { Component, effect, inject, signal, Signal } from '@angular/core';
import { faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { ErrorDto } from '@/app/error/error-dto';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ErrorAlertList } from '@/shared/error-alert-list/error-alert-list.component';
import { ButtonVariants } from '@/shared/ui/button';

/**
 * An alert component that displays local error messages to the user. It registers a unique handler
 * with the ErrorHandlerService to manage and display errors specific to its context. The component
 * provides a way to close and mark all errors as handled, ensuring that users are informed of issues
 * without overwhelming them with global error messages.
 *
 * CommentLastReviewed: 2025-11-13
 */
@Component({
  selector: 'app-error-outlet',
  imports: [ErrorAlertList],
  templateUrl: './error-outlet.component.html',
})
export class ErrorOutletComponent {
  private readonly errorService = inject(ErrorHandlerService);

  private readonly handlerId = signal<string | undefined>(undefined);
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly closeIcon = faClose;

  protected errors : Signal<ErrorDto[] > | undefined ;

  readonly initializeEffect = effect((onCleanup) => {
    const handlerId = this.errorService.registerHandler();
    this.handlerId.set(handlerId);
    onCleanup(() => {
      const destroyHandlerId = this.handlerId();
      if (destroyHandlerId) {
        this.errorService.unregisterHandler(destroyHandlerId);
      }
    });
    if (handlerId) {
      this.errors =  this.errorService.getErrorsForHandler(handlerId);

    }
  })

  closeErrors(): void {
    const handlerId = this.handlerId();
    if (handlerId) {
      this.errorService.markAllErrorsOfHandlerAsHandled(handlerId);
    }
  }
}
