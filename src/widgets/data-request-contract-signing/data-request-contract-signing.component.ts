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

import { ContractRevisionService } from '@/entities/api';
import {
  ContractRevisionDto,
  DataRequestDto,
  SignatureSlotCodeEnum,
  SignatureTypeEnum,
} from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { DataRequestContractPdfComponent } from '@/widgets/data-request-contract-pdf';
import { DataRequestContractSignaturePolicyComponent } from '@/widgets/data-request-contract-signature-policy';

import { ContractSignatureInputComponent } from './contract-signature-input/contract-signature-input.component';

/**
 * Component for signing the data request contract.
 *
 * CommentLastReviewed: 2026-05-12
 */
@Component({
  selector: 'app-data-request-contract-signing',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    CommonModule,
    AgridataContactCardComponent,
    ContractSignatureInputComponent,
    DataRequestContractPdfComponent,
    DataRequestContractSignaturePolicyComponent,
  ],
  templateUrl: './data-request-contract-signing.component.html',
})
export class DataRequestContractSigningComponent {
  // Injects
  private readonly authService = inject(AuthService);
  private readonly contractRevisionService = inject(ContractRevisionService);

  // Input/Output properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly reloadDataRequest = output<void>();

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly SignatureSlotCodeEnum = SignatureSlotCodeEnum;

  // Signals
  protected readonly isDataConsumer = this.authService.isConsumer();
  protected readonly isDataProvider = this.authService.isDataProvider();
  private readonly activeContractId = signal<string | undefined>(undefined);

  // Computed
  protected readonly contractId = computed(() => this.dataRequest().currentContractRevisionId);

  // Effects
  private readonly _syncContractIdEffect = effect(() => {
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

  protected readonly isCollectiveSignatureType = computed(() => {
    const type = this.isDataConsumer
      ? this.dataRequest().consumerSignatureType
      : this.dataRequest().providerSignatureType;
    return (
      (type ?? SignatureTypeEnum.CollectiveSignature) === SignatureTypeEnum.CollectiveSignature
    );
  });

  protected readonly slot1Signature = computed(() => {
    if (this.isDataConsumer) {
      return this.contract()?.consumerSignatures?.find(
        (s) => s.signatureSlotCode === SignatureSlotCodeEnum.DataConsumer01,
      );
    } else if (this.isDataProvider) {
      return this.contract()?.providerSignatures?.find(
        (s) => s.signatureSlotCode === SignatureSlotCodeEnum.DataProvider01,
      );
    }
    return undefined;
  });

  protected readonly slot2Signature = computed(() => {
    if (this.isDataConsumer) {
      return this.contract()?.consumerSignatures?.find(
        (s) => s.signatureSlotCode === SignatureSlotCodeEnum.DataConsumer02,
      );
    } else if (this.isDataProvider) {
      return this.contract()?.providerSignatures?.find(
        (s) => s.signatureSlotCode === SignatureSlotCodeEnum.DataProvider02,
      );
    }
    return undefined;
  });

  protected readonly showSecondSlotWaitingState = computed(() => {
    return (
      !this.slot1Signature() ||
      (this.slot1Signature()?.userId === this.authService.getUserId() && !this.slot2Signature())
    );
  });

  // Methods
  protected onSigningSuccess(contract: ContractRevisionDto): void {
    if (contract.id) {
      this.activeContractId.set(contract.id);
      this.reloadDataRequest.emit();
    }
  }
}
