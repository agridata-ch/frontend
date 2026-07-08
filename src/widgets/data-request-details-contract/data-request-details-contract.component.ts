import {
  Component,
  computed,
  DestroyRef,
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
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  ContractRevisionDto,
  DataRequestDto,
  DataRequestStateEnum,
  SealAttemptStateEnum,
} from '@/entities/openapi';
import { ACTING_ROLES } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

import { DataRequestCompletionSigningStatusComponent } from '../data-request-completion/data-request-completion-signing-status';
import { DataRequestContractPdfComponent } from '../data-request-contract-pdf';

/**
 * Component responsible for displaying the contract details of a data request, including the contract PDF and signing status.
 * Admins can seal the contract from here while the request is awaiting activation and not yet sealed. After a successful
 * seal the button briefly shows a success state before the contract is reloaded and the seal action disappears.
 *
 * CommentLastReviewed: 2026-06-25
 */
@Component({
  selector: 'app-data-request-details-contract',
  imports: [
    ButtonComponent,
    DataRequestCompletionSigningStatusComponent,
    DataRequestContractPdfComponent,
    FontAwesomeModule,
    I18nDirective,
  ],
  templateUrl: './data-request-details-contract.component.html',
})
export class DataRequestDetailsContractComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faSpinnerThird = faSpinnerThird;
  private readonly successFeedbackMs = 1500;

  // Inputs
  readonly dataRequest = input.required<DataRequestDto>();

  // Output properties
  readonly handleSeal = output<void>();

  // Signals
  protected readonly isSealing = signal(false);
  protected readonly sealSucceeded = signal(false);

  // Resources
  readonly contractResource = resource({
    params: () => {
      const contractRevisionId = this.dataRequest().currentContractRevisionId;
      return contractRevisionId
        ? { actingRole: this.stateService.actingRole(), contractRevisionId }
        : undefined;
    },
    loader: ({ params }) => {
      return this.contractRevisionService.fetchContract(
        params.contractRevisionId,
        params.actingRole,
      );
    },
  });

  // Computed
  protected readonly dataRequestContract = computed<ContractRevisionDto | null>(() => {
    if (this.contractResource.isLoading() || this.contractResource.error()) {
      return null;
    }

    return this.contractResource.value() ?? null;
  });

  protected readonly canSealContract = computed(() => {
    const contract = this.dataRequestContract();
    return (
      this.stateService.actingRole() === ACTING_ROLES.ADMIN &&
      this.dataRequest().stateCode === DataRequestStateEnum.ToBeActivated &&
      !!contract &&
      contract.sealState !== SealAttemptStateEnum.Completed
    );
  });

  // Effects
  private readonly errorHandlerEffect = effect(() => {
    const error = this.contractResource.error();
    if (error) {
      this.errorService.handleError(error);
    }
  });

  protected sealContract(): void {
    const contractRevisionId = this.dataRequest().currentContractRevisionId;
    if (!contractRevisionId) {
      return;
    }

    this.isSealing.set(true);
    this.contractRevisionService
      .sealContract(contractRevisionId)
      .then(() => {
        this.isSealing.set(false);
        this.sealSucceeded.set(true);
        this.handleSeal.emit();
        const timeoutId = setTimeout(() => {
          this.contractResource.reload();
        }, this.successFeedbackMs);
        this.destroyRef.onDestroy(() => clearTimeout(timeoutId));
      })
      .catch((error) => {
        this.isSealing.set(false);
        this.errorService.handleError(error);
      });
  }
}
