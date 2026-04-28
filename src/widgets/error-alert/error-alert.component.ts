import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';

import { ErrorDto } from '@/app/error/error-dto';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AlertComponent, AlertType } from '@/widgets/alert';

/**
 * Displays a banner of an error, emits closeError once close button is clicked
 *
 * CommentLastReviewed: 2026-04-28
 */
@Component({
  selector: 'app-error-alert',
  imports: [I18nDirective, AgridataDatePipe, AlertComponent, CommonModule],
  templateUrl: './error-alert.component.html',
})
export class ErrorAlertComponent {
  private readonly i18nService = inject(I18nService);

  readonly error = input<ErrorDto>();
  readonly closeError = output<boolean>();

  protected readonly AlertType = AlertType;

  protected errorMessage = computed(() => {
    const err = this.error();
    if (!err) {
      return '';
    }

    const messageParts: string[] = [
      this.i18nService.translate(err.i18nReason.i18n, err.i18nReason.i18nParameter),
    ];

    if (err.i18nPath) {
      messageParts.push(this.i18nService.translate(err.i18nPath.i18n, err.i18nPath.i18nParameter));
    }

    if (err.i18nErrorId) {
      messageParts.push(
        this.i18nService.translate(err.i18nErrorId.i18n, err.i18nErrorId.i18nParameter),
      );
    }

    return messageParts.join('\n');
  });
}
