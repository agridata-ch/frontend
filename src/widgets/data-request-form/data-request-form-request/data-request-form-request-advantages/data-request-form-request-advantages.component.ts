import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { faAdd } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { DataRequestAdvantageDto } from '@/entities/openapi';
import { CrossFieldGroupDirective } from '@/shared/forms/cross-field-group.directive';
import {
  crossFieldValidation,
  hasText,
  revalidateCrossFieldGroup,
} from '@/shared/forms/cross-field.validators';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';

import { MAX_ADVANTAGES, validateAdvantages } from '.';

/**
 * Manages the dynamic list of advantages for a data request. Allows adding up to five
 * multilingual advantage entries (de, fr, it), each with individual validation.
 *
 * CommentLastReviewed: 2026-06-19
 */
@Component({
  selector: 'app-data-request-form-request-advantages',
  imports: [
    ButtonComponent,
    CrossFieldGroupDirective,
    FormControlComponent,
    I18nDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './data-request-form-request-advantages.component.html',
})
export class DataRequestFormRequestAdvantagesComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly getFormControl = getFormControl;
  protected readonly faAdd = faAdd;

  // Input properties
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Signals
  private readonly advantagesArray = new FormArray<FormGroup>([]);
  private readonly advantagesCount = signal(0);

  // Computed Signals
  protected readonly canAdd = computed(() => this.advantagesCount() < MAX_ADVANTAGES);
  private readonly advantagesControl = computed(
    () => this.form()?.get('request.advantages') as FormControl | undefined,
  );

  // Effects
  private readonly initEffect = effect(() => {
    const control = this.advantagesControl();
    untracked(() => {
      control?.removeValidators(Validators.required);
      control?.addValidators(validateAdvantages);
      control?.updateValueAndValidity();

      const advantages = (control?.value as DataRequestAdvantageDto[]) ?? [];
      this.advantagesArray.clear();
      for (const advantage of advantages) {
        const group = this.createAdvantageGroup(advantage);
        // Surface errors on rows that are already filled on load; on-input revalidation is
        // handled by CrossFieldGroupDirective in the template.
        revalidateCrossFieldGroup(group);
        this.advantagesArray.push(group);
      }
      if (this.advantagesArray.length === 0) {
        this.advantagesArray.push(this.createAdvantageGroup({}));
      }
      this.advantagesCount.set(this.advantagesArray.length);
      if (advantages.length > 0) {
        control?.markAsDirty();
        control?.updateValueAndValidity();
      }
    });
  });

  // Protected methods
  protected addAdvantage(): void {
    if (!this.canAdd()) return;
    this.advantagesArray.push(this.createAdvantageGroup({}));
    this.advantagesCount.set(this.advantagesArray.length);
    this.syncToControl();
  }

  protected advantageGroup(index: number): FormGroup {
    return this.advantagesArray.at(index);
  }

  protected getAdvantagesControls(): FormGroup[] {
    return this.advantagesArray.controls;
  }

  protected removeAdvantage(index: number): void {
    this.advantagesArray.removeAt(index);
    this.advantagesCount.set(this.advantagesArray.length);
    this.syncToControl();
  }

  protected syncToControl(): void {
    const values = (this.advantagesArray.getRawValue() as DataRequestAdvantageDto[]).filter(
      (a) => hasText(a.de) || hasText(a.fr) || hasText(a.it),
    );
    this.advantagesControl()?.setValue(values);
    this.advantagesControl()?.markAsDirty();
  }

  // Private methods
  private createAdvantageGroup(advantage: DataRequestAdvantageDto): FormGroup {
    return new FormGroup({
      de: createFormControl(
        advantage.de ?? '',
        [Validators.minLength(5), Validators.maxLength(255), crossFieldValidation],
        {
          required: () => this.i18nService.translate('forms.error.required'),
          minlength: () => this.i18nService.translate('forms.error.minlength', { min: 5 }),
          maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 255 }),
        },
      ),
      fr: createFormControl(
        advantage.fr ?? '',
        [Validators.minLength(5), Validators.maxLength(255), crossFieldValidation],
        {
          required: () => this.i18nService.translate('forms.error.required'),
          minlength: () => this.i18nService.translate('forms.error.minlength', { min: 5 }),
          maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 255 }),
        },
      ),
      it: createFormControl(
        advantage.it ?? '',
        [Validators.minLength(5), Validators.maxLength(255), crossFieldValidation],
        {
          required: () => this.i18nService.translate('forms.error.required'),
          minlength: () => this.i18nService.translate('forms.error.minlength', { min: 5 }),
          maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 255 }),
        },
      ),
    });
  }
}
