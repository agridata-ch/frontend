import { Component, computed, inject, input, resource, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestStateEnum, SealAttemptStateEnum } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';

/**
 * Admin page for viewing data request details with action buttons.
 * Wraps the reusable details component and provides accept, reject, and activate actions.
 * The activate action stays disabled until the underlying contract revision is sealed.
 *
 * CommentLastReviewed: 2026-06-25
 */
@Component({
  selector: 'app-admin-data-request-details',
  imports: [ButtonComponent, DataRequestDetailsComponent, I18nDirective],
  templateUrl: './admin-data-request-details.html',
})
export class AdminDataRequestDetailsComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);

  readonly dataRequestId = input.required<string>();

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;

  // Signals
  protected readonly isAccepting = signal(false);
  protected readonly isRejecting = signal(false);
  protected readonly isActivating = signal(false);
  private readonly refreshListNeeded = signal(false);

  protected readonly isActionPending = computed(() => this.isAccepting() || this.isRejecting());

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

  protected handleClose(): void {
    this.router.navigate(['..'], {
      relativeTo: this.route,
      state: { refresh: this.refreshListNeeded() },
    });
  }

  protected handleContractSealed(): void {
    this.contractResource.reload();
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
