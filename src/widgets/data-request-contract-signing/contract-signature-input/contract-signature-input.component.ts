import { Component, computed, inject, input, model, output } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { SignatureSlotCodeEnum } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { AgridataBadgeComponent } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { AlertComponent, AlertType } from '@/widgets/alert';
import { SlotChallenge } from '@/widgets/data-request-contract-signing/data-request-contract-signing.model';

/**
 * Component for inputting the contract signature for a specific signing slot.
 *
 * CommentLastReviewed: 2026-03-20
 */
@Component({
  selector: 'app-contract-signature-input',
  imports: [
    AgridataBadgeComponent,
    I18nDirective,
    AgridataToggleComponent,
    ButtonComponent,
    AlertComponent,
    FormControlComponent,
  ],
  templateUrl: './contract-signature-input.component.html',
})
export class ContractSignatureInputComponent {
  private readonly i18nService = inject(I18nService);
  private readonly authService = inject(AuthService);

  // Input properties
  readonly currentChallenge = input<SlotChallenge | null>(null);
  readonly slotId = input.required<SignatureSlotCodeEnum>();
  readonly locked = input<boolean>(false);

  // Output properties
  readonly startSigning = output<SignatureSlotCodeEnum>();
  readonly verifySigning = output<{
    slotId: SignatureSlotCodeEnum;
    challengeId: string;
    otpCode: string;
  }>();

  // Model properties
  readonly agbChecked = model<boolean>(false);

  protected readonly isDataConsumer = this.authService.isConsumer();

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ControlTypes = ControlTypes;
  protected readonly createFormControl = createFormControl;
  protected readonly getFormControl = getFormControl;

  protected readonly otpForm = new FormGroup({
    otpCode: this.createFormControl(
      '',
      [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^\d+$/),
      ],
      {
        maxlength: () => this.i18nService.translate('forms.error.maxlength', { max: 6 }),
        minlength: () => this.i18nService.translate('forms.error.minlength', { min: 6 }),
        pattern: () => this.i18nService.translate('forms.error.onlyDigits'),
        required: () => this.i18nService.translate('forms.error.required'),
      },
    ),
  });

  // Computed signals
  protected readonly isActiveSigningSlot = computed(
    () => this.currentChallenge()?.slotId === this.slotId(),
  );

  protected readonly position = computed(() => {
    const slot = this.slotId();
    return slot === SignatureSlotCodeEnum.DataConsumer01 ||
      slot === SignatureSlotCodeEnum.DataProvider01
      ? 1
      : 2;
  });

  protected readonly agbParts = computed(() => {
    const translated = this.i18nService.translate(
      'data-request.contractSigning.signatureInput.agbText',
    );
    const open = translated.indexOf('[');
    const close = translated.indexOf(']', open);
    if (open === -1 || close === -1) return { before: translated, linkText: null, after: '' };
    return {
      before: translated.slice(0, open),
      linkText: translated.slice(open + 1, close),
      after: translated.slice(close + 1),
    };
  });

  protected handleStartSigning(): void {
    this.startSigning.emit(this.slotId());
  }

  protected handleVerifySigning($event: Event): void {
    $event.preventDefault();
    this.otpForm.markAllAsTouched();
    if (!this.otpForm.valid) return;

    const challengeId = this.currentChallenge()?.challenge?.challengeId;
    const otpCode = this.getFormControl(this.otpForm, 'otpCode')?.value;
    if (challengeId && otpCode) {
      this.verifySigning.emit({ slotId: this.slotId(), challengeId, otpCode });
    }
  }

  protected handleResendOtp(): void {
    this.handleStartSigning();
    this.otpForm.reset();
  }
}
