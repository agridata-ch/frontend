import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ContractRevisionService } from '@/entities/api';
import { SignatureSlotCodeEnum } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
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
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly authService = inject(AuthService);

  // Input properties
  readonly contractId = input<string>();

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly SignatureSlotCodeEnum = SignatureSlotCodeEnum;

  // Signals
  protected readonly currentChallenge = signal<SlotChallenge | null>(null);
  protected readonly isDataConsumer = this.authService.isConsumer();

  readonly contractResource = resource({
    params: () => ({ id: this.contractId() }),
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

  readonly startSigningProcess = (slotId: SignatureSlotCodeEnum) => {
    const contractId = this.contractId();
    if (!contractId) {
      Promise.reject(new Error('Contract ID is required to start the signing process.'));
    }

    this.contractRevisionService.startSigningProcess(contractId!, slotId).then((challenge) => {
      this.currentChallenge.set({ slotId, challenge });
    });
  };

  readonly verifySigningProcess = (
    slotId: SignatureSlotCodeEnum,
    challengeId: string,
    otpCode: string,
  ) => {
    const contractId = this.contractId();
    if (!contractId) {
      Promise.reject(new Error('Contract ID is required to verify the signing process.'));
    }

    this.contractRevisionService
      .verifySigningProcess(challengeId, contractId!, slotId, { otpCode })
      .then(() => {
        // Handle successful verification, e.g., show a success message or navigate away
      })
      .catch((error) => {
        // Handle verification failure, e.g., show an error message
        console.error('Verification failed:', error);
      });
  };
}
