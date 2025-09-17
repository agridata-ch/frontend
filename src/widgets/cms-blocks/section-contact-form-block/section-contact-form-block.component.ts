import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Block, SectionContactFormBlock } from '@/entities/cms';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { FormControlWithMessages, getFormControl } from '@/shared/lib/form.helper';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';

/**
 * Renders a contact form. The component expects a block
 *
 * CommentLastReviewed: 2025-09-16
 */
@Component({
  selector: 'app-section-contact-form-block',
  imports: [ReactiveFormsModule, I18nDirective, FormControlComponent, ButtonComponent],
  templateUrl: './section-contact-form-block.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionContactFormBlockComponent {
  readonly block = input.required<Block>();
  readonly i18nService = inject(I18nService);

  protected readonly cmsData = computed(() => {
    return this.block() as SectionContactFormBlock;
  });

  readonly getFormControl = getFormControl;
  readonly ControlTypes = ControlTypes;
  readonly ButtonVariants = ButtonVariants;

  protected readonly contactForm = new FormGroup({
    firstName: this.createFormControl('', [Validators.required], {
      required: () => this.i18nService.translate('forms.error.required'),
    }),
    lastName: this.createFormControl('', [Validators.required], {
      required: () => this.i18nService.translate('forms.error.required'),
    }),
    organisation: this.createFormControl(''),
    email: this.createFormControl('', [Validators.required, Validators.email], {
      required: () => this.i18nService.translate('forms.error.required'),
      email: () => this.i18nService.translate('forms.error.pattern'),
    }),
    phone: this.createFormControl(''),
    message: this.createFormControl('', [Validators.required, Validators.maxLength(500)], {
      required: () => this.i18nService.translate('forms.error.required'),
      maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 500 }),
    }),
  });

  private createFormControl(
    initialValue: string,
    validators: Array<Validators | ValidatorFn> = [],
    errorMessages: Record<string, () => string> = {},
  ): FormControlWithMessages {
    const control = new FormControl(
      initialValue,
      validators as ValidatorFn[],
    ) as FormControlWithMessages;
    control.errorMessages = errorMessages;

    return control;
  }

  protected readonly handleSubmit = () => {
    this.contactForm.markAllAsTouched(); // Mark all as touched to show validation errors

    if (this.contactForm.valid) {
      console.log('Form submitted with data:', this.contactForm.value);
      // Here you would implement the actual submission logic
      // For example, calling an API service

      // Reset form after submission
      this.contactForm.reset();
    }
  };
}
