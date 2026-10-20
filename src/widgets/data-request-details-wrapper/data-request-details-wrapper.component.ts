import { Component, computed, inject, input, resource, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { faCircleStop } from '@awesome.me/kit-0b6d1ed528/icons/classic/solid';

import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestStateEnum } from '@/entities/openapi';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ModalComponent } from '@/shared/ui/modal';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';
import { DATA_REQUEST_NEW_ID, DataRequestWizardComponent } from '@/widgets/data-request-wizard';

/**
 * Fetches the data request by ID and renders the appropriate child component based on its state.
 * Passes the resolved DataRequestDto down so child components don't duplicate fetch logic.
 * For active and terminating requests it also offers the terminate action, behind a confirmation modal.
 *
 * CommentLastReviewed: 2026-10-20
 */
@Component({
  selector: 'app-data-request-details-wrapper',
  imports: [
    ButtonComponent,
    DataRequestDetailsComponent,
    DataRequestWizardComponent,
    I18nDirective,
    ModalComponent,
  ],
  templateUrl: './data-request-details-wrapper.component.html',
})
export class DataRequestDetailsWrapperComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faCircleStop = faCircleStop;

  // Input properties
  readonly dataRequestId = input.required<string>();

  // Signals
  protected readonly isTerminating = signal(false);
  protected readonly showTerminateConfirmation = signal(false);
  private readonly refreshListNeeded = signal(false);

  // View Children
  private readonly detailsComponent = viewChild(DataRequestDetailsComponent);

  // Computed Signals
  protected readonly modalDescriptionParams = computed(() => {
    const request = this.dataRequest();
    return {
      requestName: this.i18nService.useObjectTranslation(request?.title),
      provider: this.masterDataService.providerName(request?.dataProviderId),
      consumer: this.i18nService.useObjectTranslation(request?.dataConsumerDisplayName),
    };
  });

  protected readonly showTerminateButton = computed(() => {
    const stateCode = this.dataRequest()?.stateCode;
    return (
      stateCode === DataRequestStateEnum.Active ||
      stateCode === DataRequestStateEnum.TerminationPending
    );
  });

  protected readonly canTerminate = computed(
    () => this.dataRequest()?.stateCode === DataRequestStateEnum.Active,
  );

  protected readonly dataRequest = computed(() => {
    return this.dataRequestsResource.isLoading() ? undefined : this.dataRequestsResource.value();
  });

  protected readonly isLoading = computed(() => this.dataRequestsResource.isLoading());

  protected readonly shouldShowActiveComponent = computed(() => {
    const stateCode = this.dataRequest()?.stateCode as DataRequestStateEnum;
    return (
      [
        DataRequestStateEnum.Active,
        DataRequestStateEnum.Paused,
        DataRequestStateEnum.TerminationPending,
        DataRequestStateEnum.Terminated,
      ] as DataRequestStateEnum[]
    ).includes(stateCode);
  });

  // Resources
  protected readonly dataRequestsResource = resource({
    params: () => ({ actingRole: this.stateService.actingRole(), id: this.dataRequestId() }),
    loader: ({ params }) => {
      return !params?.id || params.id === DATA_REQUEST_NEW_ID
        ? Promise.resolve(undefined)
        : this.dataRequestService.fetchDataRequest(params.id, params.actingRole);
    },
  });

  // Effects
  private readonly errorHandlerEffect = createResourceErrorHandlerEffect(
    this.dataRequestsResource,
    this.errorService,
  );

  protected closeTerminateConfirmation(): void {
    this.showTerminateConfirmation.set(false);
  }

  /**
   * Handles close event from data-request-details component.
   * Note: data-request-new handles its own navigation because it tracks refreshListNeeded state.
   */
  protected handleSidepanelClose(): void {
    void this.router.navigate(['..'], {
      relativeTo: this.route,
      state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
    });
  }

  protected openTerminateConfirmation(): void {
    this.showTerminateConfirmation.set(true);
  }

  protected terminateRequest(): void {
    this.closeTerminateConfirmation();
    this.isTerminating.set(true);
    this.dataRequestService
      .terminateDataRequest(this.dataRequestId(), this.stateService.actingRole())
      .then((updated) => {
        this.refreshListNeeded.set(true);
        this.toastService.show(
          this.i18nService.translate('data-request.details.terminateConfirmation.success.title'),
          this.i18nService.translate('data-request.details.terminateConfirmation.success.message', {
            date: formatDate(updated.terminationPeriodUntil),
          }),
          ToastType.Success,
        );
        if (updated.id !== this.dataRequestId()) return;
        this.dataRequestsResource.set(updated);
        this.detailsComponent()?.dataRequestResource.set(updated);
      })
      .catch((error) => this.errorService.handleError(error))
      .finally(() => this.isTerminating.set(false));
  }
}
