import { Component, input, output } from '@angular/core';

import { ErrorDto } from '@/app/error/error-dto';
import { ButtonVariants } from '@/shared/ui/button';
import { ErrorAlertComponent } from '@/widgets/error-alert/error-alert.component';

/**
 * An Alert component that displays local error messages to the user. It registers a unique handler
 * with the ErrorHandlerService to manage and display errors specific to its context. The component
 * provides a way to close and mark all errors as handled, ensuring that users are informed of issues
 * without overwhelming them with global error messages.
 *write
 * CommentLastReviewed: 2025-10-14
 */
@Component({
  selector: 'app-error-alert-list',
  imports: [ErrorAlertComponent],
  templateUrl: './error-alert-list.component.html',
})
export class ErrorAlertList {
  errors = input.required<ErrorDto[]>();
  readonly closeErrors = output<boolean>();

  protected readonly ButtonVariants = ButtonVariants;
}
