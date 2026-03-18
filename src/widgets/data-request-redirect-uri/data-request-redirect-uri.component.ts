import { Component, effect, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestValidRedirectUriRegexUpdateDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';

/**
 * Displays a form for editing and saving the valid redirect URI regex of a data request.
 *
 * CommentLastReviewed: 2026-03-17
 */
@Component({
  selector: 'app-data-request-redirect-uri',
  imports: [ButtonComponent, FormControlComponent, I18nDirective, ReactiveFormsModule],
  templateUrl: './data-request-redirect-uri.component.html',
})
export class DataRequestRedirectUriComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly createFormControl = createFormControl;
  protected readonly getFormControl = getFormControl;
  protected readonly regexValidator: ValidatorFn = (control: AbstractControl) => {
    if (!control.value) return null;
    try {
      // we can ignore the lint warning here as we only use this for validation
      // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(control.value);
      return null;
    } catch {
      return { invalidRegex: true };
    }
  };

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly isValidRedirectUriRegexEditable = input(false);

  // Signals
  protected readonly isSavingValidRedirectUriRegex = signal(false);
  protected readonly redirectUriForm = new FormGroup({
    validRedirectUriRegex: this.createFormControl(
      '',
      [this.regexValidator, Validators.maxLength(255)],
      {
        invalidRegex: () => this.i18nService.translate('forms.error.pattern'),
        maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 255 }),
      },
    ),
  });

  // Effects
  private readonly editableEffect = effect(() => {
    const control = this.redirectUriForm.get('validRedirectUriRegex');
    if (this.isValidRedirectUriRegexEditable()) {
      control?.enable();
    } else {
      control?.disable();
    }
  });

  private readonly syncFormEffect = effect(() => {
    this.redirectUriForm.patchValue({
      validRedirectUriRegex: this.dataRequest().validRedirectUriRegex ?? '',
    });
  });

  protected handleSubmit(): void {
    this.redirectUriForm.markAllAsTouched(); // Mark all as touched to show validation errors
    if (!this.redirectUriForm.valid) {
      return;
    }

    this.isSavingValidRedirectUriRegex.set(true);
    this.dataRequestService
      .updateDataRequestValidRedirectUriRegex(
        this.dataRequest().id,
        this.redirectUriForm.value as DataRequestValidRedirectUriRegexUpdateDto,
      )
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isSavingValidRedirectUriRegex.set(false));
  }
}
