import { Component, computed, ErrorHandler, inject, input, output } from '@angular/core';

import { DataRequestService } from '@/entities/api';
import { ContractRevisionDto, DataRequestDto, SignatureTypeEnum } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  AgridataRadioGroupComponent,
  AgridataRadioGroupOption,
  AgridataRadioGroupValue,
} from '@/shared/ui/agridata-radio-group';

/**
 * Displays and updates the signature policy selection for the current contract party.
 *
 * CommentLastReviewed: 2026-04-30
 */
@Component({
  selector: 'app-data-request-contract-signature-policy',
  imports: [I18nDirective, AgridataRadioGroupComponent],
  templateUrl: './data-request-contract-signature-policy.component.html',
})
export class DataRequestContractSignaturePolicyComponent {
  private readonly authService = inject(AuthService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorHandler = inject(ErrorHandler);
  private readonly i18nService = inject(I18nService);

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly contract = input.required<ContractRevisionDto>();
  readonly disabled = input<boolean>(false);

  // Output properties
  readonly handleReloadDataRequest = output<void>();

  // Constants
  protected readonly isDataConsumer = this.authService.isConsumer();

  // Computed signals
  protected readonly companyName = computed(() =>
    this.isDataConsumer ? this.contract()?.dataConsumerName : this.contract()?.dataProviderName,
  );

  protected readonly policyOptions = computed<readonly AgridataRadioGroupOption[]>(() => [
    {
      subtitle: this.i18nService.translate(
        'data-request.contractSignaturePolicy.options.collective.subtitle',
        { company: this.companyName() },
      ),
      title: this.i18nService.translate(
        'data-request.contractSignaturePolicy.options.collective.title',
      ),
      value: SignatureTypeEnum.CollectiveSignature,
    },
    {
      subtitle: this.i18nService.translate(
        'data-request.contractSignaturePolicy.options.individual.subtitle',
        { company: this.companyName() },
      ),
      title: this.i18nService.translate(
        'data-request.contractSignaturePolicy.options.individual.title',
      ),
      value: SignatureTypeEnum.IndividualSignature,
    },
  ]);

  protected readonly selectedPolicy = computed(
    () =>
      (this.isDataConsumer
        ? this.dataRequest().consumerSignatureType
        : this.dataRequest().providerSignatureType) ?? SignatureTypeEnum.CollectiveSignature,
  );

  protected handlePolicyChange(value: AgridataRadioGroupValue | undefined) {
    if (this.disabled() || !this.isSignatureTypeEnum(value)) {
      return;
    }

    this.dataRequestService
      .setSignatureType(this.dataRequest().id, value)
      .then(() => {
        this.handleReloadDataRequest.emit();
      })
      .catch((error) => {
        this.errorHandler.handleError(error);
      });
  }

  private isSignatureTypeEnum(
    value: AgridataRadioGroupValue | undefined,
  ): value is SignatureTypeEnum {
    return (
      value === SignatureTypeEnum.CollectiveSignature ||
      value === SignatureTypeEnum.IndividualSignature
    );
  }
}
