import { Component, effect, inject, input, signal } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestValidRedirectUriRegexUpdateDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ViewSectionDirective } from '@/shared/view-section';

/**
 * Displays a form for editing and saving the valid redirect URI regex of a data request.
 *
 * CommentLastReviewed: 2026-03-17
 */
@Component({
  selector: 'app-data-request-redirect-uri',
  imports: [FormControlComponent, I18nDirective, ReactiveFormsModule, ViewSectionDirective],
  templateUrl: './data-request-redirect-uri.component.html',
})
export class DataRequestRedirectUriComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Constants
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

  // Value to restore when an edit is cancelled. Snapshotted when edit mode opens, because the
  // dataRequest input is not refreshed after a save and would restore a stale value.
  private editBaseline = '';

  // Signals
  protected readonly isViewMode = signal(true);
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
    // The form is submitted implicitly when pressing enter inside the input, so the view mode and
    // editability have to be checked here and not only on the save button.
    if (this.isViewMode() || !this.isValidRedirectUriRegexEditable()) {
      return;
    }

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
      // Only a successful save closes the editor - otherwise the field would show a value that
      // was never persisted.
      .then(() => this.isViewMode.set(true))
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isSavingValidRedirectUriRegex.set(false));
  }

  protected toggleViewMode(): void {
    if (this.isViewMode()) {
      this.editBaseline = this.redirectUriForm.getRawValue().validRedirectUriRegex ?? '';
    } else {
      // Leaving edit mode is a cancel, so drop the pending edit instead of keeping it.
      this.redirectUriForm.patchValue({ validRedirectUriRegex: this.editBaseline });
    }
    this.isViewMode.set(!this.isViewMode());
  }
}
