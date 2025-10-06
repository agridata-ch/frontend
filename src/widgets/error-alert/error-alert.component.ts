import { Component, input, output } from '@angular/core';

import { ErrorDto } from '@/app/error/error-dto';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective } from '@/shared/i18n';
import { AlertComponent, AlertType } from '@/widgets/alert';

/**
 * Displays a banner of an error, emits closeError once close button is clicked
 *
 * CommentLastReviewed: 2025-10-13
 */
@Component({
  selector: 'app-error-alert',
  imports: [I18nDirective, AgridataDatePipe, AlertComponent],
  templateUrl: './error-alert.component.html',
})
export class ErrorAlertComponent {
  readonly error = input<ErrorDto>();
  readonly closeError = output<boolean>();

  protected readonly AlertType = AlertType;
}
