import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
} from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { ContractRevisionDto, SignatureSlotCodeEnum } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { ToastService, ToastType } from '@/shared/toast';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

import { ContractSignatureInputComponent } from './contract-signature-input/contract-signature-input.component';
import { SlotChallenge } from './data-request-contract-signing.model';

/**
 * Component for signing the data request contract.
 *
 * CommentLastReviewed: 2026-03-20
 */
@Component({
  selector: 'app-data-request-contract-signing',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    CommonModule,
    AgridataContactCardComponent,
    ContractSignatureInputComponent,
  ],
  templateUrl: './data-request-contract-signing.component.html',
})
export class DataRequestContractSigningComponent {
  private readonly authService = inject(AuthService);
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly toastService = inject(ToastService);

  // Input/Output properties
  readonly contractId = input<string>();
  readonly reloadDataRequest = output<void>();

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly SignatureSlotCodeEnum = SignatureSlotCodeEnum;

  // Signals
  protected readonly currentChallenge = signal<SlotChallenge | null>(null);
  protected readonly isDataConsumer = this.authService.isConsumer();
  private readonly activeContractId = signal<string | undefined>(undefined);

  // Effects
  private readonly syncContractIdEffect = effect(() => {
    this.activeContractId.set(this.contractId());
  });

  // Resources
  readonly contractResource = resource({
    params: () => ({ id: this.activeContractId() }),
    loader: ({ params }) => {
      if (!params?.id) {
        return Promise.resolve(null);
      }
      return this.contractRevisionService.fetchContract(params.id);
    },
    defaultValue: null,
  });

  // Computed signals
  protected readonly contract = createResourceValueComputed(this.contractResource);

  protected readonly companyName = computed(() =>
    this.isDataConsumer ? this.contract()?.dataConsumerName : this.contract()?.dataProviderName,
  );

  protected readonly slot1Signature = computed(() => {
    return this.contract()?.consumerSignatures?.find(
      (s) =>
        s.signatureSlotCode ===
        (this.isDataConsumer
          ? SignatureSlotCodeEnum.DataConsumer01
          : SignatureSlotCodeEnum.DataProvider01),
    );
  });

  protected readonly slot2Signature = computed(() =>
    this.contract()?.consumerSignatures?.find(
      (s) =>
        s.signatureSlotCode ===
        (this.isDataConsumer
          ? SignatureSlotCodeEnum.DataConsumer02
          : SignatureSlotCodeEnum.DataProvider02),
    ),
  );

  protected readonly showSecondSlotWaitingState = computed(() => {
    // Show waiting state for the second slot if the first slot is signed by the current user and the second slot is not signed yet
    return (
      !this.slot1Signature() ||
      (this.slot1Signature()?.userId === this.authService.getUserId() && !this.slot2Signature())
    );
  });

  // Methods
  readonly startSigningProcess = (slotId: SignatureSlotCodeEnum) => {
    const contractId = this.contractId();
    if (!contractId) {
      return Promise.reject(new Error('Contract ID is required to start the signing process.'));
    }

    return this.contractRevisionService
      .startSigningProcess(contractId, slotId)
      .then((challenge) => {
        this.currentChallenge.set({ slotId, challenge });
      })
      .catch((error) => {
        this.errorService.handleError(error);
      });
  };

  readonly verifySigningProcess = (
    slotId: SignatureSlotCodeEnum,
    challengeId: string,
    otpCode: string,
  ) => {
    const contractId = this.contractId();
    if (!contractId) {
      return Promise.reject(new Error('Contract ID is required to verify the signing process.'));
    }
    return this.contractRevisionService
      .verifySigningProcess(challengeId, contractId, slotId, { otpCode })
      .then((response: ContractRevisionDto) => {
        // Handle successful verification, e.g., show a success message or navigate away
        this.toastService.show(
          this.i18nService.translate('data-request.contractSigning.verifySigning.success.title'),
          this.i18nService.translate('data-request.contractSigning.verifySigning.success.message'),
          ToastType.Success,
        );
        this.currentChallenge.set(null);
        if (response.id) {
          this.activeContractId.set(response.id);
          this.reloadDataRequest.emit();
        }
      })
      .catch(() => {
        // Handle verification failure, e.g., show an error message
        this.toastService.show(
          this.i18nService.translate('data-request.contractSigning.verifySigning.error.title'),
          this.i18nService.translate('data-request.contractSigning.verifySigning.error.message'),
          ToastType.Error,
        );
      });
  };
}
