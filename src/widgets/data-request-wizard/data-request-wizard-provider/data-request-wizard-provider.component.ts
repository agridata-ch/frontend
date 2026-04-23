import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal, Signal, untracked } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ToastType } from '@/shared/toast';
import { ButtonComponent } from '@/shared/ui/button';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';
import { DataRequestCompletionComponent } from '@/widgets/data-request-completion';
import { DataRequestFormContractComponent } from '@/widgets/data-request-form';
import { DataRequestPreviewComponent } from '@/widgets/data-request-preview';
import { dataRequestProviderFormsModel, FORM_GROUP_NAMES } from '@/widgets/data-request-wizard';
import { DataRequestWizardBaseComponent } from '@/widgets/data-request-wizard/data-request-wizard-base';

/**
 * Provider-specific data request wizard. Displays read-only preview and handles
 * contract signing from the provider perspective.
 *
 * CommentLastReviewed: 2026-04-09
 */
@Component({
  selector: 'app-data-request-wizard-provider',
  imports: [
    AgridataWizardComponent,
    ButtonComponent,
    CommonModule,
    DataRequestCompletionComponent,
    DataRequestFormContractComponent,
    DataRequestPreviewComponent,
    ErrorOutletComponent,
    FontAwesomeModule,
    I18nDirective,
    ReactiveFormsModule,
    SidepanelComponent,
  ],
  templateUrl: './data-request-wizard-provider.component.html',
})
export class DataRequestWizardProviderComponent extends DataRequestWizardBaseComponent {
  // Constants
  protected override readonly formsModel = dataRequestProviderFormsModel;
  protected override readonly listRoutePath = ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH;

  // Signals
  protected readonly isHandlingReleaseDataRequest = signal<boolean>(false);
  protected override readonly stepLabelMap: Record<string, Signal<string | undefined>> = {
    [FORM_GROUP_NAMES.COMPLETION]: this.i18nService.translateSignal(
      'data-request.wizard.provider.steps.completion',
    ),
    [FORM_GROUP_NAMES.CONTRACT]: this.i18nService.translateSignal(
      'data-request.wizard.provider.steps.contract',
    ),
    [FORM_GROUP_NAMES.PREVIEW]: this.i18nService.translateSignal(
      'data-request.wizard.provider.steps.preview',
    ),
  };

  // Computed Signals
  protected readonly canReleaseContract = computed(() => {
    const request = this.dataRequest();
    return request?.stateCode === DataRequestStateEnum.ToBeReleasedByProvider;
  });

  protected readonly isInCompletionStepStates = computed(() => {
    const stateCode = this.dataRequest()?.stateCode;
    return (
      [
        DataRequestStateEnum.ToBeReleasedByProvider,
        DataRequestStateEnum.ToBeActivated,
        DataRequestStateEnum.Active,
      ] as DataRequestStateEnum[]
    ).includes(stateCode as DataRequestStateEnum);
  });

  // Effects
  private readonly setInitialWizardStepEffect = effect(() => {
    const wizard = this.wizard();
    const loading = this.isLoading();
    if (loading || !wizard) return;

    untracked(() => {
      if (wizard && this.isInCompletionStepStates()) {
        wizard.handleChangeStep(
          this.formControlSteps().findIndex((step) => step.id === FORM_GROUP_NAMES.COMPLETION) || 0,
        );
      }
    });
  });

  // Overrides
  protected override checkExternalCompletion(formGroupName: string): boolean {
    const stateCode = this.dataRequest()?.stateCode;
    if (formGroupName === FORM_GROUP_NAMES.CONTRACT) {
      return this.isInCompletionStepStates();
    } else if (formGroupName === FORM_GROUP_NAMES.COMPLETION) {
      return (
        stateCode === DataRequestStateEnum.ToBeActivated ||
        stateCode === DataRequestStateEnum.Active
      );
    }
    return true;
  }

  protected override getInitialStepDisabled(formGroupName: string): boolean {
    return formGroupName === FORM_GROUP_NAMES.COMPLETION;
  }

  protected override getStepDisabled(stepId: string, stateCode: string | undefined): boolean {
    if (stepId === FORM_GROUP_NAMES.COMPLETION) {
      return (
        stateCode !== DataRequestStateEnum.ToBeReleasedByProvider &&
        stateCode !== DataRequestStateEnum.ToBeActivated &&
        stateCode !== DataRequestStateEnum.Active
      );
    }
    return false;
  }

  // Protected methods
  protected async handleReleaseContract() {
    const dataRequestId = this.currentDataRequestId();
    if (!dataRequestId || !this.canReleaseContract()) return;

    this.isHandlingReleaseDataRequest.set(true);

    await this.dataRequestService
      .releaseDataRequestToBeActivated(dataRequestId)
      .then((dataRequest: DataRequestDto) => {
        this.toastService.show(
          this.i18nService.translate('data-request.wizard.provider.releaseContract.success.title'),
          this.i18nService.translate(
            'data-request.wizard.provider.releaseContract.success.message',
          ),
          ToastType.Success,
        );
        this.refreshListNeeded.set(true);
        this.dataRequest.set(dataRequest);
        this.updateFormSteps();
      })
      .catch((error) => {
        this.errorService.handleError(error);
      })
      .finally(() => this.isHandlingReleaseDataRequest.set(false));
  }
}
