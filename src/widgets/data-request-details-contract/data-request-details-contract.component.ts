import { Component, computed, effect, inject, input, resource } from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { ContractRevisionDto, DataRequestDto } from '@/entities/openapi';

import { DataRequestCompletionSigningStatusComponent } from '../data-request-completion/data-request-completion-signing-status';
import { DataRequestContractPdfComponent } from '../data-request-contract-pdf';

/**
 * Component responsible for displaying the contract details of a data request, including the contract PDF and signing status.
 *
 * CommentLastReviewed: 2026-04-23
 */
@Component({
  selector: 'app-data-request-details-contract',
  imports: [
    DataRequestCompletionSigningStatusComponent,
    DataRequestContractPdfComponent,
    FontAwesomeModule,
  ],
  templateUrl: './data-request-details-contract.component.html',
})
export class DataRequestDetailsContractComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly errorService = inject(ErrorHandlerService);

  // Inputs
  readonly dataRequest = input.required<DataRequestDto>();

  // Constants
  protected readonly faSpinnerThird = faSpinnerThird;

  // Resources
  readonly contractResource = resource({
    params: () => {
      const contractRevisionId = this.dataRequest().currentContractRevisionId;
      return contractRevisionId ? { contractRevisionId } : undefined;
    },
    loader: ({ params }) => {
      return this.contractRevisionService.fetchContract(params.contractRevisionId);
    },
  });

  // Computed
  protected readonly dataRequestContract = computed<ContractRevisionDto | null>(() => {
    if (this.contractResource.isLoading() || this.contractResource.error()) {
      return null;
    }

    return this.contractResource.value() ?? null;
  });

  // Effects
  private readonly errorHandlerEffect = effect(() => {
    const error = this.contractResource.error();
    if (error) {
      this.errorService.handleError(error);
    }
  });
}
