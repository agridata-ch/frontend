import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  ContractRevisionDto,
  ExceptionEnum,
  SignatureSlotCodeEnum,
  ContractRevisionSignatureDto,
} from '@/entities/openapi';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { contractAgbUrl } from '@/shared/lib/cms';
import { createFormControl, getFormControl } from '@/shared/lib/form.helper';
import { ToastService, ToastType } from '@/shared/toast';
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
 * Handles the full OTP signing flow: starting, verifying, and error display.
 *
 * CommentLastReviewed: 2026-05-12
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
  // Injects
  private readonly authService = inject(AuthService);
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);

  // Input properties
  readonly contractId = input<string | undefined>();
  readonly existingSignature = input<ContractRevisionSignatureDto | undefined>();
  readonly slotId = input.required<SignatureSlotCodeEnum>();
  readonly showWaitingState = input<boolean>(false);

  // Constants
  protected readonly contractAgbUrl = contractAgbUrl;

  // Output properties
  readonly signingSuccess = output<ContractRevisionDto>();

  // Model properties
  readonly agbChecked = model<boolean>(false);

  // Signals
  protected readonly currentChallenge = signal<SlotChallenge | null>(null);
  protected readonly countdownValue = signal(0);
  protected readonly showResendCooldownAlert = signal(false);
  protected readonly showLockedAlert = signal(false);
  protected readonly isVerifyDisabled = signal(false);

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
        otpExpired: () =>
          this.i18nService.translate(
            'data-request.contractSigning.signatureInput.otp.error.expired',
          ),
        otpInvalid: () =>
          this.i18nService.translate(
            'data-request.contractSigning.signatureInput.otp.error.invalid',
          ),
        otpLocked: () =>
          this.i18nService.translate(
            'data-request.contractSigning.signatureInput.otp.error.locked',
          ),
        pattern: () => this.i18nService.translate('forms.error.onlyDigits'),
        required: () => this.i18nService.translate('forms.error.required'),
      },
    ),
  });

  // Methods
  protected handleStartSigning(): void {
    this.startSigningInternal();
    this.startResendCountdown();
  }

  protected handleVerifySigning($event: Event): void {
    $event.preventDefault();
    this.otpForm.markAllAsTouched();
    if (!this.otpForm.valid) return;
    this.verifySigningInternal();
  }

  protected handleResendOtp(): void {
    if (this.isResendDisabled()) return;
    this.isVerifyDisabled.set(false);
    this.showLockedAlert.set(false);
    this.handleStartSigning();
    this.otpForm.reset();
  }

  private startSigningInternal(): void {
    const contractId = this.contractId();
    if (!contractId) return;

    this.contractRevisionService
      .startSigningProcess(contractId, this.slotId(), this.stateService.actingRole())
      .then((challenge) => {
        this.currentChallenge.set({ slotId: this.slotId(), challenge });
        this.showResendCooldownAlert.set(false);
      })
      .catch((error: HttpErrorResponse) => {
        const type = error?.error?.type as ExceptionEnum | undefined;
        if (type === ExceptionEnum.OtpResendCooldown) {
          this.showResendCooldownAlert.set(true);
        } else {
          this.errorService.handleError(error);
        }
      });
  }

  private verifySigningInternal(): void {
    this.isVerifyDisabled.set(true);
    const contractId = this.contractId();
    const challengeId = this.currentChallenge()?.challenge?.challengeId;
    const otpCode = this.getFormControl(this.otpForm, 'otpCode')?.value;

    if (!contractId || !challengeId || !otpCode) return;

    this.contractRevisionService
      .verifySigningProcess(
        challengeId,
        contractId,
        this.slotId(),
        { otpCode },
        this.stateService.actingRole(),
      )
      .then((response: ContractRevisionDto) => {
        this.toastService.show(
          this.i18nService.translate('data-request.contractSigning.verifySigning.success.title'),
          this.i18nService.translate('data-request.contractSigning.verifySigning.success.message'),
          ToastType.Success,
        );
        this.currentChallenge.set(null);
        this.showLockedAlert.set(false);
        this.signingSuccess.emit(response);
      })
      .catch((error: HttpErrorResponse) => {
        const type = error?.error?.type as ExceptionEnum | undefined;
        const otpControl = this.getFormControl(this.otpForm, 'otpCode');
        switch (type) {
          case ExceptionEnum.OtpInvalid: {
            otpControl?.setErrors({ otpInvalid: true });

            break;
          }
          case ExceptionEnum.OtpExpired: {
            otpControl?.setErrors({ otpExpired: true });

            break;
          }
          case ExceptionEnum.OtpLocked: {
            otpControl?.setErrors({ otpLocked: true });
            this.showLockedAlert.set(true);

            break;
          }
          default: {
            this.errorService.handleError(error);
          }
        }
      })
      .finally(() => {
        if (!this.showLockedAlert()) {
          this.isVerifyDisabled.set(false);
        }
      });
  }

  private startResendCountdown(): void {
    this.countdownTimer = startCountdown(
      this.countdownValue,
      RESEND_OTP_INTERVAL_MS / 1000,
      this.countdownTimer,
    );
  }
}
