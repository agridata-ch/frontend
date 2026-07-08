import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
} from '@angular/core';
import { FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { Block, CmsService, OnboardingFormData, SectionOnboardingFormBlock } from '@/entities/cms';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';
import { LinkedTextParts, parseLinkedText } from '@/shared/utils';

import { AGATE_URLS } from './section-onboarding-form-block.model';

/**
 * Renders an onboarding form with company details and a dynamic list of persons.
 *
 * CommentLastReviewed: 2026-06-05
 */
@Component({
  selector: 'app-section-onboarding-form-block',
  imports: [ReactiveFormsModule, I18nDirective, FormControlComponent, ButtonComponent],
  templateUrl: './section-onboarding-form-block.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionOnboardingFormBlockComponent {
  readonly block = input.required<Block>();

  // Injects
  protected readonly cmsService = inject(CmsService);
  private readonly elementRef = inject(ElementRef);
  protected readonly i18nService = inject(I18nService);
  protected readonly toastService = inject(ToastService);

  // Constants
  readonly ButtonVariants = ButtonVariants;
  readonly ControlTypes = ControlTypes;
  readonly getFormControl = getFormControl;

  // Computed signals
  protected readonly agateUrl = computed(
    () => AGATE_URLS[this.i18nService.lang()] ?? AGATE_URLS['de'],
  );
  protected readonly cmsData = computed(() => this.block() as SectionOnboardingFormBlock);
  protected readonly personSubheadingParts = computed<LinkedTextParts>(() =>
    parseLinkedText(this.i18nService.translate('onboardingForm.data-request-person.subheading')),
  );

  protected readonly onboardingForm = new FormGroup({
    uid: createFormControl(''),
    company: createFormControl(''),
    country: createFormControl(''),
    street: createFormControl(''),
    number: createFormControl(''),
    postalCode: createFormControl(''),
    city: createFormControl(''),
    contactPerson: new FormGroup({
      salutation: createFormControl(''),
      firstName: createFormControl(''),
      lastName: createFormControl(''),
      email: createFormControl('', [Validators.email], {
        email: () => this.i18nService.translate('forms.error.pattern'),
      }),
      phone: createFormControl(''),
    }),
    persons: new FormArray([this.createPersonGroup()]),
    additionalNotes: createFormControl('', [Validators.maxLength(500)], {
      maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 500 }),
    }),
    existingAgateSystems: createFormControl('', [Validators.maxLength(500)], {
      maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 500 }),
    }),
    interestedDataDescription: createFormControl('', [Validators.maxLength(500)], {
      maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 500 }),
    }),
    ownSystemDescription: createFormControl('', [Validators.maxLength(500)], {
      maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 500 }),
    }),
    wishedDateRange: createFormControl('', [Validators.maxLength(250)], {
      maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 250 }),
    }),
  });

  protected readonly contactPersonGroup = this.onboardingForm.get('contactPerson') as FormGroup;
  protected readonly personsArray = this.onboardingForm.get('persons') as FormArray;

  protected personGroup(index: number): FormGroup {
    return this.personsArray.at(index) as FormGroup;
  }

  protected addPerson(): void {
    this.personsArray.push(this.createPersonGroup());
  }

  protected removePerson(index: number): void {
    if (this.personsArray.length > 1) {
      this.personsArray.removeAt(index);
    }
  }

  protected readonly handleSubmit = async () => {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      const firstInvalid = this.elementRef.nativeElement.querySelector(
        'input.ng-invalid, textarea.ng-invalid, select.ng-invalid',
      );
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const data = this.onboardingForm.getRawValue() as OnboardingFormData;

    await this.cmsService
      .submitOnboardingForm(data)
      .then(() => {
        this.resetForm();
        this.toastService.show(
          this.i18nService.translate('onboardingForm.success.title'),
          this.i18nService.translate('onboardingForm.success.message'),
          ToastType.Success,
        );
      })
      .catch((error: Error) => {
        this.toastService.show(
          this.i18nService.translate('onboardingForm.error.title'),
          this.i18nService.translate('onboardingForm.error.message', { error: error.message }),
          ToastType.Error,
        );
      });
  };

  private createPersonGroup(): FormGroup {
    return new FormGroup({
      agateNumber: createFormControl(''),
      email: createFormControl('', [Validators.email], {
        email: () => this.i18nService.translate('forms.error.pattern'),
      }),
      firstName: createFormControl(''),
      function: createFormControl(''),
      lastName: createFormControl(''),
      mobileNumber: createFormControl(''),
    });
  }

  private resetForm(): void {
    this.onboardingForm.reset();
    this.personsArray.clear();
    this.personsArray.push(this.createPersonGroup());
  }
}
