import { Component, computed, inject, input, resource, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faCirclePause, faCirclePlay } from '@awesome.me/kit-0b6d1ed528/icons/classic/solid';

import { ContractRevisionService, DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestStateEnum, SealAttemptStateEnum } from '@/entities/openapi';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/shared/data-request';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';

/**
 * Admin page for viewing data request details with action buttons.
 * Wraps the reusable details component and provides accept, reject, activate, pause, and reactivate actions.
 * The activate action stays disabled until the underlying contract revision is sealed.
 *
 * CommentLastReviewed: 2026-10-20
 */
@Component({
  selector: 'app-admin-data-request-details',
  imports: [ButtonComponent, DataRequestDetailsComponent, I18nDirective, ModalComponent],
  templateUrl: './admin-data-request-details.html',
})
export class AdminDataRequestDetailsComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);

  readonly dataRequestId = input.required<string>();

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;
  protected readonly faCirclePause = faCirclePause;
  protected readonly faCirclePlay = faCirclePlay;

  // Signals
  protected readonly isAccepting = signal(false);
  protected readonly isRejecting = signal(false);
  protected readonly isActivating = signal(false);
  protected readonly isPausing = signal(false);
  protected readonly isReactivating = signal(false);
  protected readonly showPauseConfirmation = signal(false);
  protected readonly showReactivateConfirmation = signal(false);
  private readonly refreshListNeeded = signal(false);

  protected readonly isActionPending = computed(
    () => this.isAccepting() || this.isRejecting() || this.isPausing() || this.isReactivating(),
  );

  // View Children
  private readonly detailsComponent = viewChild(DataRequestDetailsComponent);

  // Resources
  private readonly contractResource = resource({
    params: () => {
      const contractRevisionId = this.detailsComponent()?.dataRequest()?.currentContractRevisionId;
      return contractRevisionId
        ? { actingRole: this.stateService.actingRole(), contractRevisionId }
        : undefined;
    },
    loader: ({ params }) =>
      this.contractRevisionService.fetchContract(params.contractRevisionId, params.actingRole),
  });

  // Computed Signals
  protected readonly contractNotSealed = computed(
    () => this.contractResource.value()?.sealState !== SealAttemptStateEnum.Completed,
  );

  protected readonly modalDescriptionParams = computed(() => {
    const request = this.detailsComponent()?.dataRequest();
    return {
      requestName: this.i18nService.useObjectTranslation(request?.title),
      provider: this.masterDataService.providerName(request?.dataProviderId),
      consumer: this.i18nService.useObjectTranslation(request?.dataConsumerDisplayName),
    };
  });

  protected acceptRequest(): void {
    this.isAccepting.set(true);
    this.dataRequestService
      .approveDataRequest(this.dataRequestId(), this.stateService.actingRole())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.detailsComponent()?.dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isAccepting.set(false));
  }

  protected activateRequest(): void {
    this.isActivating.set(true);
    this.dataRequestService
      .activateDataRequest(this.dataRequestId(), this.stateService.actingRole())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.detailsComponent()?.dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isActivating.set(false));
  }

  protected openPauseConfirmation(): void {
    this.showPauseConfirmation.set(true);
  }

  protected pauseRequest(): void {
    this.closePauseConfirmation();
    this.isPausing.set(true);
    this.dataRequestService
      .pauseDataRequest(this.dataRequestId(), this.stateService.actingRole())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.detailsComponent()?.dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isPausing.set(false));
  }

  protected closePauseConfirmation(): void {
    this.showPauseConfirmation.set(false);
  }

  protected handleClose(): void {
    void this.router.navigate(['..'], {
      relativeTo: this.route,
      state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
    });
  }

  protected handleContractSealed(): void {
    this.contractResource.reload();
  }

  protected closeReactivateConfirmation(): void {
    this.showReactivateConfirmation.set(false);
  }

  protected openReactivateConfirmation(): void {
    this.showReactivateConfirmation.set(true);
  }

  protected reactivateRequest(): void {
    this.closeReactivateConfirmation();
    this.isReactivating.set(true);
    this.dataRequestService
      .activateDataRequest(this.dataRequestId(), this.stateService.actingRole())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.detailsComponent()?.dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isReactivating.set(false));
  }

  protected rejectRequest(): void {
    this.isRejecting.set(true);
    this.dataRequestService
      .retreatDataRequest(this.dataRequestId(), this.stateService.actingRole())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.handleClose();
      })
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isRejecting.set(false));
  }
}
