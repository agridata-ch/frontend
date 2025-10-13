import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { Block, CmsService, ContactFormData, SectionContactFormBlock } from '@/entities/cms';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { FormControlWithMessages, getFormControl } from '@/shared/lib/form.helper';
import { ToastService, ToastType } from '@/shared/toast';
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
  readonly cmsService = inject(CmsService);
  readonly toastService = inject(ToastService);

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

  protected readonly handleSubmit = async () => {
    this.contactForm.markAllAsTouched(); // Mark all as touched to show validation errors

    if (this.contactForm.valid) {
      await this.cmsService
        .submitContactForm(this.contactForm.value as ContactFormData)
        .then(() => {
          this.contactForm.reset();
          this.toastService.show(
            this.i18nService.translate('contact-form.success.title'),
            this.i18nService.translate('contact-form.success.message'),
            ToastType.Success,
          );
        })
        .catch((error) => {
          this.toastService.show(
            this.i18nService.translate('contact-form.error.title'),
            this.i18nService.translate('contact-form.error.message', { error: error.message }),
            ToastType.Error,
          );
        });
    }
  };
}
