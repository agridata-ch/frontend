import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { ContractRevisionSignatureDto, SignatureSlotCodeEnum } from '@/entities/openapi';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { contractAgbUrl } from '@/shared/lib/cms';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { AgridataToggleComponent } from '@/shared/ui/agridata-toggle';
import { AgridataBadgeComponent } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { startCountdown } from '@/shared/utils';
import { AlertComponent, AlertType } from '@/widgets/alert';
import {
  RESEND_OTP_INTERVAL_MS,
  SlotChallenge,
} from '@/widgets/data-request-contract-signing/data-request-contract-signing.model';

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
    AgridataDatePipe,
  ],
  templateUrl: './contract-signature-input.component.html',
})
export class ContractSignatureInputComponent {
  private readonly i18nService = inject(I18nService);
  private readonly authService = inject(AuthService);

  // Input properties
  readonly currentChallenge = input<SlotChallenge | null>(null);
  readonly existingSignature = input<ContractRevisionSignatureDto | undefined>();
  readonly slotId = input.required<SignatureSlotCodeEnum>();
  readonly showWaitingState = input<boolean>(false);

  // Constants
  protected readonly contractAgbUrl = contractAgbUrl;

  // Output properties
  readonly startSigning = output<SignatureSlotCodeEnum>();
  readonly verifySigning = output<{
    slotId: SignatureSlotCodeEnum;
    challengeId: string;
    otpCode: string;
  }>();

  // Model properties
  readonly agbChecked = model<boolean>(false);

  // Signals
  protected readonly countdownValue = signal(0);

  // Computed properties
  protected readonly isResendDisabled = computed(() => this.countdownValue() > 0);
  protected readonly signedDateText = computed(() => {
    const timestamp = this.existingSignature()?.timestamp;
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleDateString(this.i18nService.lang(), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  });
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

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ControlTypes = ControlTypes;

  protected readonly createFormControl = createFormControl;
  protected readonly getFormControl = getFormControl;
  protected readonly isDataConsumer = this.authService.isConsumer();

  private countdownTimer?: ReturnType<typeof setInterval>;

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

  // Methods
  protected handleStartSigning(): void {
    this.startSigning.emit(this.slotId());
    this.startResendCountdown();
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

  private startResendCountdown(): void {
    this.countdownTimer = startCountdown(
      this.countdownValue,
      RESEND_OTP_INTERVAL_MS / 1000,
      this.countdownTimer,
    );
  }
}
